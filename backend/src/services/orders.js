import crypto from "node:crypto";
import { withTransaction } from "../db.js";
import { conflict, invalid, notFound } from "../errors.js";

// Unambiguous alphabet (no 0/O/1/I) for server-generated references.
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateRef() {
  let s = "PH-";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[crypto.randomInt(REF_ALPHABET.length)];
  return s;
}

/** Last 9 digits: matches 0712 345 678, +254 712 345 678 and 712345678 alike. */
export const phoneKey = (phone) => phone.replace(/\D/g, "").slice(-9);

const isDupRef = (err) => err?.code === "ER_DUP_ENTRY" && /uq_orders_ref/.test(err.sqlMessage ?? "");
const nullIfEmpty = (v) => (v === undefined || v === null || v === "" ? null : v);

// --- serialization ----------------------------------------------------------
function serializeItems(items) {
  return items.map((i) => ({
    sku: i.sku,
    slug: i.slug,
    name: i.name,
    color: i.color,
    price: i.unit_price,
    quantity: i.quantity,
  }));
}

/** Full order (admin shape — mirrors what the admin UI has always shown). */
/** DATE column -> "YYYY-MM-DD" (mysql2 returns a local-midnight Date). */
function toDateString(d) {
  if (!d) return null;
  if (typeof d === "string") return d.slice(0, 10);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function serializeOrder(row, items) {
  return {
    id: row.id,
    ref: row.ref,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email,
      address: row.customer_address,
      county: row.county,
      town: row.town,
    },
    items: serializeItems(items),
    subtotal: row.subtotal,
    deliveryMethod: row.delivery_method,
    deliveryFee: row.delivery_fee,
    total: row.total,
    notes: row.notes,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    mpesaCode: row.mpesa_code,
    mpesaName: row.mpesa_name,
    status: row.status,
    courier: row.courier,
    trackingNumber: row.tracking_number,
    expectedDelivery: toDateString(row.expected_delivery),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- checkout -----------------------------------------------------------------
/**
 * Places an order. Only SKU + quantity are taken from the client: names and
 * prices come from the database, stock is checked and decremented in the same
 * transaction (row-locked, so two shoppers can't both take the last unit).
 */
export async function createOrder({ pool }, input) {
  const wanted = new Map();
  for (const it of input.items) wanted.set(it.sku, (wanted.get(it.sku) ?? 0) + it.quantity);
  for (const [sku, qty] of wanted) {
    if (qty > 20) throw invalid("Quantity too high", [{ path: "items", message: `At most 20 of "${sku}" per order` }]);
  }

  const attempts = input.ref ? 1 : 5;
  for (let i = 0; ; i++) {
    const ref = input.ref ?? generateRef();
    try {
      return await withTransaction(pool, (conn) => placeOrder(conn, input, wanted, ref));
    } catch (err) {
      if (isDupRef(err)) {
        if (!input.ref && i < attempts - 1) continue; // unlucky random collision: try another
        throw conflict("This order reference is already in use", { field: "ref" }, "DUPLICATE");
      }
      throw err;
    }
  }
}

async function placeOrder(conn, input, wanted, ref) {
  const [rows] = await conn.query(
    `SELECT p.id, p.sku, p.slug, p.name, p.color, p.price, p.stock_count, p.in_stock, p.active,
            c.active AS category_active
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.sku IN (?) ORDER BY p.id FOR UPDATE`,
    [[...wanted.keys()]]
  );
  const bySku = new Map(rows.map((r) => [r.sku, r]));

  const lines = [];
  for (const [sku, quantity] of wanted) {
    const p = bySku.get(sku);
    if (!p || !p.active || !p.category_active || !p.in_stock) {
      throw conflict(`"${p?.name ?? sku}" is no longer available`, { sku }, "ITEM_UNAVAILABLE");
    }
    const tracked = p.stock_count !== null;
    if (tracked && p.stock_count < quantity) {
      throw conflict(
        p.stock_count === 0 ? `"${p.name}" is out of stock` : `Only ${p.stock_count} of "${p.name}" left`,
        { sku, available: p.stock_count },
        "INSUFFICIENT_STOCK"
      );
    }
    lines.push({ p, quantity, tracked });
  }

  const subtotal = lines.reduce((sum, l) => sum + (l.p.price ?? 0) * l.quantity, 0);
  const total = subtotal + input.deliveryFee;
  const c = input.customer;

  const [result] = await conn.query(
    `INSERT INTO orders
      (ref, customer_name, customer_phone, phone_key, customer_email, customer_address, county, town,
       delivery_method, delivery_fee, subtotal, total, notes, payment_method, mpesa_code, mpesa_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ref, c.name, c.phone, phoneKey(c.phone), nullIfEmpty(c.email), c.address, nullIfEmpty(c.county), nullIfEmpty(c.town),
      input.deliveryMethod, input.deliveryFee, subtotal, total, nullIfEmpty(input.notes), input.paymentMethod,
      nullIfEmpty(input.mpesaCode), nullIfEmpty(input.mpesaName),
    ]
  );

  await conn.query(
    "INSERT INTO order_items (order_id, product_id, sku, slug, name, color, unit_price, quantity, stock_decremented) VALUES ?",
    [lines.map((l) => [result.insertId, l.p.id, l.p.sku, l.p.slug, l.p.name, l.p.color, l.p.price, l.quantity, l.tracked ? 1 : 0])]
  );
  for (const l of lines) {
    if (l.tracked) await conn.query("UPDATE products SET stock_count = stock_count - ? WHERE id = ?", [l.quantity, l.p.id]);
  }

  const [[order]] = await conn.query("SELECT created_at FROM orders WHERE id = ?", [result.insertId]);
  return {
    ref,
    status: "pending",
    paymentStatus: "pending",
    deliveryMethod: input.deliveryMethod,
    deliveryFee: input.deliveryFee,
    subtotal,
    total,
    items: lines.map((l) => ({ sku: l.p.sku, name: l.p.name, price: l.p.price, quantity: l.quantity })),
    createdAt: order.created_at,
  };
}

// --- public tracking ------------------------------------------------------------
/** Only ref + matching phone reveals anything, and only a sanitised summary. */
export async function trackOrder(pool, ref, phone) {
  const [rows] = await pool.query(
    `SELECT o.ref, o.status, o.payment_status, o.created_at, o.updated_at, o.delivery_method, o.county, o.total,
            o.payment_method, o.mpesa_code, o.courier, o.tracking_number, o.expected_delivery,
            (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_id = o.id) AS item_count
     FROM orders o WHERE o.ref = ? AND o.phone_key = ? LIMIT 1`,
    [ref, phoneKey(phone)]
  );
  if (!rows.length) throw notFound("Order"); // same answer for "no such ref" and "wrong phone"
  const o = rows[0];
  return {
    ref: o.ref,
    status: o.status,
    paymentStatus: o.payment_status,
    placedAt: o.created_at,
    updatedAt: o.updated_at,
    deliveryMethod: o.delivery_method,
    county: o.county,
    itemCount: Number(o.item_count),
    total: o.total,
    paymentMethod: o.payment_method,
    // Lets the page say "code received, we're confirming" instead of a bare "pending".
    mpesaCodeSubmitted: Boolean(o.mpesa_code),
    courier: o.courier,
    trackingNumber: o.tracking_number,
    expectedDelivery: toDateString(o.expected_delivery),
  };
}

// --- admin ------------------------------------------------------------------------
const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

async function attachItems(pool, rows) {
  if (!rows.length) return [];
  const [items] = await pool.query("SELECT * FROM order_items WHERE order_id IN (?) ORDER BY id", [rows.map((r) => r.id)]);
  const byOrder = new Map();
  for (const it of items) byOrder.set(it.order_id, [...(byOrder.get(it.order_id) ?? []), it]);
  return rows.map((r) => serializeOrder(r, byOrder.get(r.id) ?? []));
}

export async function listOrders(pool, f) {
  const where = [];
  const params = [];
  if (f.status) { where.push("o.status = ?"); params.push(f.status); }
  if (f.paymentStatus) { where.push("o.payment_status = ?"); params.push(f.paymentStatus); }
  if (f.q) {
    const like = `%${escapeLike(f.q)}%`;
    const digits = f.q.replace(/\D/g, "").replace(/^(254|0)/, "");
    const parts = ["o.ref LIKE ?", "o.customer_name LIKE ?", "o.customer_email LIKE ?"];
    params.push(like, like, like);
    if (digits.length >= 3) { parts.push("o.phone_key LIKE ?"); params.push(`%${digits}%`); }
    where.push(`(${parts.join(" OR ")})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM orders o ${whereSql}`, params);
  const [rows] = await pool.query(
    `SELECT o.* FROM orders o ${whereSql} ORDER BY o.created_at DESC, o.id DESC LIMIT ? OFFSET ?`,
    [...params, f.limit, (f.page - 1) * f.limit]
  );
  return {
    items: await attachItems(pool, rows),
    total,
    page: f.page,
    limit: f.limit,
    totalPages: Math.max(1, Math.ceil(total / f.limit)),
  };
}

export async function getOrder(pool, id) {
  const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
  if (!rows.length) throw notFound("Order");
  return (await attachItems(pool, rows))[0];
}

export async function getOrderByRef(pool, ref) {
  const [rows] = await pool.query("SELECT * FROM orders WHERE ref = ?", [ref]);
  return rows.length ? (await attachItems(pool, rows))[0] : null;
}

/** Cancelled orders are frozen; cancelling gives back the stock that checkout took. */
export async function updateOrder(pool, id, patch) {
  await withTransaction(pool, async (conn) => {
    const [rows] = await conn.query("SELECT id, status FROM orders WHERE id = ? FOR UPDATE", [id]);
    if (!rows.length) throw notFound("Order");
    if (rows[0].status === "cancelled") {
      throw conflict("Cancelled orders can't be changed", undefined, "ORDER_CANCELLED");
    }
    const sets = [];
    const params = [];
    if (patch.status) { sets.push("status = ?"); params.push(patch.status); }
    if (patch.paymentStatus) { sets.push("payment_status = ?"); params.push(patch.paymentStatus); }
    if (patch.courier !== undefined) { sets.push("courier = ?"); params.push(patch.courier); }
    if (patch.trackingNumber !== undefined) { sets.push("tracking_number = ?"); params.push(patch.trackingNumber); }
    if (patch.expectedDelivery !== undefined) { sets.push("expected_delivery = ?"); params.push(patch.expectedDelivery); }
    await conn.query(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`, [...params, id]);

    if (patch.status === "cancelled") {
      await conn.query(
        `UPDATE order_items oi JOIN products p ON p.id = oi.product_id
         SET p.stock_count = p.stock_count + oi.quantity, oi.stock_decremented = 0
         WHERE oi.order_id = ? AND oi.stock_decremented = 1 AND p.stock_count IS NOT NULL`,
        [id]
      );
    }
  });
  return getOrder(pool, id);
}
