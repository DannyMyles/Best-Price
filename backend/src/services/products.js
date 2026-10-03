import { HttpError, invalid, notFound, parse, rethrowDuplicate } from "../errors.js";
import { productCreateSchema } from "../schemas.js";
import { slugify } from "../lib/slug.js";

// --- serialization -------------------------------------------------------
function parseSpecs(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "string" || !raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Storefront-compatible product shape (matches src/lib/types.ts `Product`). */
export function serializeProduct(row, images, { admin = false } = {}) {
  const out = {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category_slug,
    categoryName: row.category_name,
    brand: row.brand,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    description: row.description,
    specs: parseSpecs(row.specs),
    color: row.color,
    inStock: Boolean(row.in_stock),
    stockCount: row.stock_count,
    badge: row.badge,
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    reviewCount: row.review_count,
    featured: Boolean(row.featured),
    featureRank: row.feature_rank,
    images: images.map((i) => i.url),
    // Public too, so the sitemap can report real last-change dates.
    updatedAt: row.updated_at,
  };
  if (admin) {
    out.active = Boolean(row.active);
    out.imageDir = row.image_dir;
    out.adminNotes = row.admin_notes;
    out.createdAt = row.created_at;
  }
  return out;
}

const SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name
  FROM products p JOIN categories c ON c.id = p.category_id`;

const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

const ORDER = {
  featured: "p.featured DESC, p.feature_rank IS NULL, p.feature_rank ASC, p.name ASC",
  "price-asc": "p.price IS NULL, p.price ASC, p.name ASC",
  "price-desc": "p.price IS NULL, p.price DESC, p.name ASC",
  name: "p.name ASC",
  newest: "p.created_at DESC, p.id DESC",
};

function buildWhere(f, { publicOnly }) {
  const where = [];
  const params = [];
  if (publicOnly) where.push("p.active = 1", "c.active = 1");
  else if (f.active !== undefined) {
    where.push("p.active = ?");
    params.push(f.active ? 1 : 0);
  }
  if (f.category) {
    where.push("c.slug = ?");
    params.push(f.category);
  }
  if (f.brand) {
    where.push("p.brand = ?");
    params.push(f.brand);
  }
  if (f.minPrice !== undefined) {
    where.push("p.price >= ?");
    params.push(f.minPrice);
  }
  if (f.maxPrice !== undefined) {
    where.push("p.price <= ?");
    params.push(f.maxPrice);
  }
  if (f.inStock) where.push("p.in_stock = 1 AND (p.stock_count IS NULL OR p.stock_count > 0)");
  if (f.featured) where.push("p.featured = 1");

  // Every whitespace-separated term must match somewhere (AND), like the storefront search.
  const terms = (f.q ?? "").split(/\s+/).filter(Boolean).slice(0, 6);
  for (const term of terms) {
    where.push("(p.name LIKE ? OR p.sku LIKE ? OR p.slug LIKE ? OR p.brand LIKE ? OR p.description LIKE ? OR c.name LIKE ?)");
    const like = `%${escapeLike(term)}%`;
    params.push(like, like, like, like, like, like);
  }
  return { sql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

// --- queries ---------------------------------------------------------------
export async function listProducts({ pool, images }, filters, { publicOnly }) {
  const { sql: whereSql, params } = buildWhere(filters, { publicOnly });
  const offset = (filters.page - 1) * filters.limit;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id ${whereSql}`,
    params
  );
  const [rows] = await pool.query(`${SELECT} ${whereSql} ORDER BY ${ORDER[filters.sort]} LIMIT ? OFFSET ?`, [
    ...params,
    filters.limit,
    offset,
  ]);

  const withImages = await images.listForProducts(rows.map((r) => r.id));
  return {
    items: rows.map((r) => serializeProduct(r, withImages.get(r.id), { admin: !publicOnly })),
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

async function fetchOne({ pool, images }, whereSql, param, { publicOnly }) {
  const [rows] = await pool.query(
    `${SELECT} WHERE ${whereSql}${publicOnly ? " AND p.active = 1 AND c.active = 1" : ""} LIMIT 1`,
    [param]
  );
  if (!rows.length) throw notFound("Product");
  return serializeProduct(rows[0], await images.list(rows[0].id), { admin: !publicOnly });
}

export const getProductById = (ctx, id, opts = { publicOnly: false }) => fetchOne(ctx, "p.id = ?", id, opts);
export const getProductBySlug = (ctx, slug, opts = { publicOnly: true }) => fetchOne(ctx, "p.slug = ?", slug, opts);

// --- writes ----------------------------------------------------------------
async function categoryIdBySlug(pool, slug) {
  const [rows] = await pool.query("SELECT id FROM categories WHERE slug = ?", [slug]);
  if (!rows.length) throw invalid("Unknown category", [{ path: "category", message: `No category with slug "${slug}"` }]);
  return rows[0].id;
}

const nullIfEmpty = (v) => (v === undefined || v === null || v === "" ? null : v);
const bit = (b) => (b ? 1 : 0);

export async function createProduct(ctx, input) {
  const { pool } = ctx;
  const categoryId = await categoryIdBySlug(pool, input.category);

  const slug = input.slug ?? (slugify(`${input.name}-${input.sku}`) || null);
  if (!slug) throw invalid("Could not derive a slug — provide one", [{ path: "slug", message: "Required" }]);

  try {
    const [result] = await pool.query(
      `INSERT INTO products
        (slug, sku, name, category_id, brand, price, compare_at_price, description, specs, color,
         in_stock, stock_count, badge, featured, feature_rank, active, image_dir, admin_notes, rating, review_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        input.sku,
        input.name,
        categoryId,
        nullIfEmpty(input.brand),
        input.price ?? null,
        input.compareAtPrice ?? null,
        input.description ?? "",
        JSON.stringify(input.specs ?? []),
        nullIfEmpty(input.color),
        bit(input.inStock ?? true),
        input.stockCount ?? null,
        input.badge ?? null,
        bit(input.featured ?? false),
        input.featureRank ?? null,
        bit(input.active ?? true),
        null, // image_dir: legacy import pointer, unused for new products
        nullIfEmpty(input.adminNotes),
        input.rating ?? null,
        input.reviewCount ?? null,
      ]
    );
    return getProductById(ctx, result.insertId);
  } catch (err) {
    rethrowDuplicate(err, "A product with this SKU or slug already exists");
  }
}

const COLUMN = {
  name: "name",
  sku: "sku",
  brand: "brand",
  price: "price",
  compareAtPrice: "compare_at_price",
  description: "description",
  specs: "specs",
  color: "color",
  inStock: "in_stock",
  stockCount: "stock_count",
  badge: "badge",
  featured: "featured",
  featureRank: "feature_rank",
  active: "active",
  adminNotes: "admin_notes",
  rating: "rating",
  reviewCount: "review_count",
};
const TO_DB = {
  specs: (v) => JSON.stringify(v ?? []),
  inStock: bit,
  featured: bit,
  active: bit,
  brand: nullIfEmpty,
  color: nullIfEmpty,
  adminNotes: nullIfEmpty,
  description: (v) => v ?? "",
};

export async function updateProduct(ctx, id, input) {
  const { pool } = ctx;
  const sets = [];
  const params = [];
  for (const [key, col] of Object.entries(COLUMN)) {
    if (input[key] === undefined) continue;
    sets.push(`${col} = ?`);
    params.push((TO_DB[key] ?? ((v) => v))(input[key]));
  }
  if (input.category !== undefined) {
    sets.push("category_id = ?");
    params.push(await categoryIdBySlug(pool, input.category));
  }
  if (!sets.length) throw invalid("No fields to update");

  try {
    const [result] = await pool.query(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`, [...params, id]);
    if (result.affectedRows === 0) throw notFound("Product");
  } catch (err) {
    rethrowDuplicate(err);
  }
  return getProductById(ctx, id);
}

/** Deletes the product; its stored photos go with it (ON DELETE CASCADE). */
export async function deleteProduct({ pool }, id) {
  const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
  if (result.affectedRows === 0) throw notFound("Product");
}

/** Row lookup used by the image routes. */
export async function getProductRow(pool, id) {
  const [rows] = await pool.query("SELECT id, name, image_dir, category_id FROM products WHERE id = ?", [id]);
  if (!rows.length) throw notFound("Product");
  return rows[0];
}

/**
 * CSV/bulk import: each row is created, or — when its SKU already exists —
 * updated with just the fields the row supplies. One bad row never blocks the
 * rest; the response lists per-row errors.
 */
export async function bulkUpsertProducts(ctx, rows) {
  let created = 0;
  let updated = 0;
  const errors = [];
  for (const [i, raw] of rows.entries()) {
    try {
      const input = parse(productCreateSchema, raw);
      const [existing] = await ctx.pool.query("SELECT id FROM products WHERE sku = ?", [input.sku]);
      if (existing.length) {
        // eslint-disable-next-line no-unused-vars
        const { slug, ...fields } = input;
        await updateProduct(ctx, existing[0].id, fields);
        updated++;
      } else {
        await createProduct(ctx, input);
        created++;
      }
    } catch (err) {
      if (!(err instanceof HttpError)) throw err;
      const first = err.details?.[0];
      errors.push({ row: i + 1, sku: raw?.sku ?? null, message: first ? `${first.path}: ${first.message}` : err.message });
    }
  }
  return { created, updated, errors };
}
