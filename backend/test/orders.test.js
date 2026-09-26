import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Client, makeCategory, makeProduct, signedInClient, startTestServer } from "./helpers.js";

const payload = (over = {}) => ({
  customer: { name: "Jane Wanjiru", phone: "0712 345 678", address: "Westlands, Nairobi", county: "Nairobi", town: "Westlands" },
  items: [{ sku: "CAM-1", quantity: 1 }],
  deliveryMethod: "courier",
  deliveryFee: 500,
  paymentMethod: "mpesa",
  ...over,
});

describe("checkout: placing orders", () => {
  let server, admin, anon;
  const stock = async (sku) => (await server.pool.query("SELECT stock_count FROM products WHERE sku = ?", [sku]))[0][0].stock_count;
  const orderCount = async () => (await server.pool.query("SELECT COUNT(*) AS n FROM orders"))[0][0].n;

  before(async () => {
    server = await startTestServer({ options: { orderLimit: 1000, trackLimit: 1000 } });
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras");
    await makeCategory(admin, "hidden", { active: false });
    await makeProduct(admin, { name: "Cam One", sku: "CAM-1", price: 1000, stockCount: 5 });
    await makeProduct(admin, { name: "Cam Two", sku: "CAM-2", price: 2500 }); // stock not tracked
    await makeProduct(admin, { name: "Cam Empty", sku: "CAM-3", price: 900, stockCount: 0 });
    await makeProduct(admin, { name: "Cam Off", sku: "CAM-4", price: 900, active: false });
    await makeProduct(admin, { name: "Cam Hidden Dept", sku: "CAM-5", price: 900, category: "hidden" });
    await makeProduct(admin, { name: "Cam Flagged", sku: "CAM-6", price: 900, inStock: false });
    await makeProduct(admin, { name: "Cam POA", sku: "CAM-7", price: null });
  });
  after(() => server.close());

  it("creates an order, computing everything from the database", async () => {
    const r = await anon.post("/api/orders", payload({
      // a tampering client sends its own name/price — both must be ignored
      items: [{ sku: "CAM-1", quantity: 2, price: 1, name: "Free camera" }, { sku: "CAM-2", quantity: 1 }],
      notes: "Call before delivery",
    }));
    assert.equal(r.status, 201);
    assert.match(r.body.ref, /^PH-[A-HJ-NP-Z2-9]{6}$/);
    assert.equal(r.body.subtotal, 2 * 1000 + 2500);
    assert.equal(r.body.total, 2 * 1000 + 2500 + 500);
    assert.deepEqual(r.body.items.map((i) => [i.sku, i.name, i.price, i.quantity]), [["CAM-1", "Cam One", 1000, 2], ["CAM-2", "Cam Two", 2500, 1]]);
    assert.equal(r.body.status, "pending");
    assert.equal(r.body.paymentStatus, "pending");
    assert.ok(!JSON.stringify(r.body).includes("Jane"), "the response doesn't echo personal data");

    const [items] = await server.pool.query("SELECT unit_price, name FROM order_items ORDER BY id DESC LIMIT 2");
    assert.ok(items.every((i) => i.unit_price !== 1 && i.name !== "Free camera"));
  });

  it("decrements tracked stock only", async () => {
    const before1 = await stock("CAM-1");
    const before2 = await stock("CAM-2");
    await anon.post("/api/orders", payload({ items: [{ sku: "CAM-1", quantity: 1 }, { sku: "CAM-2", quantity: 3 }] }));
    assert.equal(await stock("CAM-1"), before1 - 1);
    assert.equal(await stock("CAM-2"), before2, "null stock = not tracked, stays null");
    assert.equal(before2, null);
  });

  it("refuses when tracked stock is short — and rolls the whole order back", async () => {
    const stockBefore = await stock("CAM-1");
    const ordersBefore = await orderCount();
    const r = await anon.post("/api/orders", payload({ items: [{ sku: "CAM-2", quantity: 1 }, { sku: "CAM-1", quantity: stockBefore + 1 }] }));
    assert.equal(r.status, 409);
    assert.equal(r.body.error.code, "INSUFFICIENT_STOCK");
    assert.deepEqual(r.body.error.details, { sku: "CAM-1", available: stockBefore });
    assert.equal(await stock("CAM-1"), stockBefore);
    assert.equal(await orderCount(), ordersBefore, "no partial order was saved");

    const empty = await anon.post("/api/orders", payload({ items: [{ sku: "CAM-3", quantity: 1 }] }));
    assert.equal(empty.status, 409);
    assert.match(empty.body.error.message, /out of stock/i);
  });

  it("refuses unknown, inactive, hidden-category and flagged-out products", async () => {
    for (const sku of ["NOPE-1", "CAM-4", "CAM-5", "CAM-6"]) {
      const r = await anon.post("/api/orders", payload({ items: [{ sku, quantity: 1 }] }));
      assert.equal(r.status, 409, sku);
      assert.equal(r.body.error.code, "ITEM_UNAVAILABLE", sku);
    }
  });

  it("merges repeated SKUs and caps quantity per product", async () => {
    const before = await stock("CAM-1");
    const ok = await anon.post("/api/orders", payload({ items: [{ sku: "CAM-1", quantity: 1 }, { sku: "CAM-1", quantity: 1 }] }));
    assert.equal(ok.status, 201);
    assert.equal(ok.body.items.length, 1);
    assert.equal(ok.body.items[0].quantity, 2);
    assert.equal(await stock("CAM-1"), before - 2);
    const tooMany = await anon.post("/api/orders", payload({ items: [{ sku: "CAM-2", quantity: 15 }, { sku: "CAM-2", quantity: 10 }] }));
    assert.equal(tooMany.status, 422);
  });

  it("supports price-on-request items (they add nothing to the total)", async () => {
    const r = await anon.post("/api/orders", payload({ items: [{ sku: "CAM-7", quantity: 1 }, { sku: "CAM-2", quantity: 1 }], deliveryFee: 0 }));
    assert.equal(r.status, 201);
    assert.equal(r.body.subtotal, 2500);
    assert.equal(r.body.items.find((i) => i.sku === "CAM-7").price, null);
  });

  it("accepts a client reference (keeps the WhatsApp message in sync) but never a duplicate", async () => {
    const first = await anon.post("/api/orders", payload({ ref: "ph-abcd12", items: [{ sku: "CAM-2", quantity: 1 }] }));
    assert.equal(first.status, 201);
    assert.equal(first.body.ref, "PH-ABCD12", "normalised to upper case");
    const dup = await anon.post("/api/orders", payload({ ref: "PH-ABCD12", items: [{ sku: "CAM-2", quantity: 1 }] }));
    assert.equal(dup.status, 409);
    assert.deepEqual(dup.body.error.details, { field: "ref" });
    for (const ref of ["XX-1234", "PH-", "PH-12", "PH-!!!!!!", "PH-" + "A".repeat(20)]) {
      assert.equal((await anon.post("/api/orders", payload({ ref }))).status, 422, ref);
    }
  });

  it("validates the request (422) and saves nothing", async () => {
    const ordersBefore = await orderCount();
    const stockBefore = await stock("CAM-1");
    const bad = [
      payload({ items: [] }),
      payload({ items: [{ sku: "CAM-1", quantity: 0 }] }),
      payload({ items: [{ sku: "CAM-1", quantity: 1.5 }] }),
      payload({ items: [{ sku: "CAM-1", quantity: "2" }] }),
      payload({ customer: { name: "J", phone: "0712345678", address: "x" } }),
      payload({ customer: { name: "Jane Doe", phone: "abc", address: "x" } }),
      payload({ customer: { name: "Jane Doe", phone: "12345", address: "x" } }),
      payload({ customer: { name: "Jane Doe", phone: "0712345678", address: "" } }),
      payload({ customer: { name: "Jane Doe", phone: "0712345678", address: "x", email: "not-an-email" } }),
      payload({ deliveryFee: -1 }),
      payload({ deliveryFee: 1_000_000 }),
      payload({ deliveryMethod: "drone" }),
      payload({ paymentMethod: "bitcoin" }),
      payload({ mpesaCode: "bad code!" }),
      payload({ notes: "x".repeat(1001) }),
      {},
    ];
    for (const body of bad) {
      const r = await anon.post("/api/orders", body);
      assert.equal(r.status, 422, JSON.stringify(body).slice(0, 120));
    }
    assert.equal(await orderCount(), ordersBefore);
    assert.equal(await stock("CAM-1"), stockBefore);
  });

  it("doesn't need an address for pickup, but does for courier", async () => {
    const noAddr = { name: "Jane Doe", phone: "0712345678", address: "" };
    const pickup = await anon.post("/api/orders", payload({ customer: noAddr, deliveryMethod: "pickup", deliveryFee: 0, items: [{ sku: "CAM-2", quantity: 1 }] }));
    assert.equal(pickup.status, 201);
    const courier = await anon.post("/api/orders", payload({ customer: noAddr, deliveryMethod: "courier", items: [{ sku: "CAM-2", quantity: 1 }] }));
    assert.equal(courier.status, 422);
    assert.equal(courier.body.error.details[0].path, "customer.address");
  });

  it("stores optional fields and normalises the M-Pesa code", async () => {
    const r = await anon.post("/api/orders", payload({
      customer: { name: "Jane Doe", phone: "+254 712 345 678", email: "jane@example.com", address: "CBD" },
      items: [{ sku: "CAM-2", quantity: 1 }],
      mpesaCode: "sgh7x2k9qp", mpesaName: "Jane W.", deliveryMethod: "pickup", deliveryFee: 0,
    }));
    assert.equal(r.status, 201);
    const o = await admin.get(`/api/admin/orders?q=${r.body.ref}`);
    const saved = o.body.items[0];
    assert.equal(saved.mpesaCode, "SGH7X2K9QP");
    assert.equal(saved.customer.email, "jane@example.com");
    assert.equal(saved.deliveryMethod, "pickup");
  });

  it("never oversells: 5 shoppers race for the last 3 units", async () => {
    await makeProduct(admin, { name: "Last Units", sku: "RACE-1", price: 100, stockCount: 3 });
    const results = await Promise.all(
      Array.from({ length: 5 }, () => new Client(server.base).post("/api/orders", payload({ items: [{ sku: "RACE-1", quantity: 1 }] })))
    );
    const ok = results.filter((r) => r.status === 201).length;
    const rejected = results.filter((r) => r.status === 409 && r.body.error.code === "INSUFFICIENT_STOCK").length;
    assert.equal(ok, 3);
    assert.equal(rejected, 2);
    assert.equal(await stock("RACE-1"), 0);
    const [[{ n }]] = await server.pool.query("SELECT COALESCE(SUM(quantity),0) AS n FROM order_items WHERE sku = 'RACE-1'");
    assert.equal(Number(n), 3);
  });

  it("keeps the order's price snapshot when the catalogue changes later", async () => {
    await makeProduct(admin, { name: "Snapshot", sku: "SNAP-1", price: 5000 });
    const placed = await anon.post("/api/orders", payload({ items: [{ sku: "SNAP-1", quantity: 1 }], deliveryFee: 0 }));
    const [[p]] = await server.pool.query("SELECT id FROM products WHERE sku = 'SNAP-1'");
    await admin.patch(`/api/admin/products/${p.id}`, { price: 9999, name: "Renamed" });
    const saved = (await admin.get(`/api/admin/orders?q=${placed.body.ref}`)).body.items[0];
    assert.equal(saved.total, 5000);
    assert.equal(saved.items[0].price, 5000);
    assert.equal(saved.items[0].name, "Snapshot");
    await admin.del(`/api/admin/products/${p.id}`); // deleting the product doesn't destroy the order
    const after = (await admin.get(`/api/admin/orders?q=${placed.body.ref}`)).body.items[0];
    assert.equal(after.items[0].name, "Snapshot");
  });
});

describe("order tracking (public, privacy-preserving)", () => {
  let server, admin, anon, ref;
  before(async () => {
    server = await startTestServer({ options: { orderLimit: 1000, trackLimit: 1000 } });
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras");
    await makeProduct(admin, { name: "Tracked Cam", sku: "TRK-1", price: 1000 });
    const r = await anon.post("/api/orders", payload({ items: [{ sku: "TRK-1", quantity: 2 }] }));
    ref = r.body.ref;
  });
  after(() => server.close());

  it("shows a sanitised summary to the right ref + phone, in any phone format", async () => {
    for (const phone of ["0712345678", "0712 345 678", "+254712345678", "254 712 345 678", "712345678"]) {
      const r = await anon.post("/api/orders/track", { ref, phone });
      assert.equal(r.status, 200, phone);
      assert.deepEqual(Object.keys(r.body).sort(), ["county", "deliveryMethod", "itemCount", "paymentStatus", "placedAt", "ref", "status", "total", "updatedAt"]);
      assert.equal(r.body.itemCount, 2);
      assert.equal(r.body.total, 2500);
      assert.ok(!JSON.stringify(r.body).match(/Jane|Westlands|0712/), "no personal data in the response");
    }
    assert.equal((await anon.post("/api/orders/track", { ref: ref.toLowerCase(), phone: "0712345678" })).status, 200, "ref is case-insensitive");
  });

  it("gives an identical 404 for a wrong phone and an unknown reference", async () => {
    const wrongPhone = await anon.post("/api/orders/track", { ref, phone: "0799999999" });
    const noRef = await anon.post("/api/orders/track", { ref: "PH-ZZZZZZ", phone: "0712345678" });
    assert.equal(wrongPhone.status, 404);
    assert.equal(noRef.status, 404);
    assert.deepEqual(wrongPhone.body, noRef.body);
  });

  it("reflects status changes made by the admin", async () => {
    const [[o]] = await server.pool.query("SELECT id FROM orders WHERE ref = ?", [ref]);
    await admin.patch(`/api/admin/orders/${o.id}`, { status: "confirmed", paymentStatus: "paid" });
    const r = await anon.post("/api/orders/track", { ref, phone: "0712345678" });
    assert.equal(r.body.status, "confirmed");
    assert.equal(r.body.paymentStatus, "paid");
  });

  it("shows dispatch details; status-only updates keep them; blanks clear them", async () => {
    const [[o]] = await server.pool.query("SELECT id FROM orders WHERE ref = ?", [ref]);
    const track = async () => (await anon.post("/api/orders/track", { ref, phone: "0712345678" })).body;
    const d = await admin.patch(`/api/admin/orders/${o.id}`, {
      status: "dispatched", courier: "G4S", trackingNumber: "G4S-1", expectedDelivery: "2030-01-02",
    });
    assert.equal(d.status, 200);
    assert.deepEqual([d.body.courier, d.body.trackingNumber, d.body.expectedDelivery], ["G4S", "G4S-1", "2030-01-02"]);
    await admin.patch(`/api/admin/orders/${o.id}`, { paymentStatus: "paid" });
    const t = await track();
    assert.deepEqual([t.status, t.courier, t.trackingNumber, t.expectedDelivery], ["dispatched", "G4S", "G4S-1", "2030-01-02"]);
    assert.equal(typeof t.mpesaCodeSubmitted, "boolean");
    assert.equal((await admin.patch(`/api/admin/orders/${o.id}`, { expectedDelivery: "next week" })).status, 422);
    await admin.patch(`/api/admin/orders/${o.id}`, { courier: "", trackingNumber: null });
    const cleared = await track();
    assert.deepEqual([cleared.courier, cleared.trackingNumber, cleared.expectedDelivery], [null, null, "2030-01-02"]);
  });

  it("validates input and has no GET variant (phone stays out of URLs)", async () => {
    assert.equal((await anon.post("/api/orders/track", { ref })).status, 422);
    assert.equal((await anon.post("/api/orders/track", { phone: "0712345678" })).status, 422);
    assert.equal((await anon.post("/api/orders/track", { ref, phone: "abc" })).status, 422);
    assert.equal((await anon.get(`/api/orders/track?ref=${ref}&phone=0712345678`)).status, 404);
  });
});

describe("public write rate limits", () => {
  let server, admin;
  before(async () => {
    server = await startTestServer({ options: { orderLimit: 2, trackLimit: 3 } });
    admin = await signedInClient(server);
    await makeCategory(admin, "cameras");
    await makeProduct(admin, { name: "Limited", sku: "LIM-1", price: 100 });
  });
  after(() => server.close());

  it("throttles order spam and tracking enumeration (429)", async () => {
    const c = new Client(server.base);
    assert.equal((await c.post("/api/orders", payload({ items: [{ sku: "LIM-1", quantity: 1 }] }))).status, 201);
    assert.equal((await c.post("/api/orders", payload({ items: [{ sku: "LIM-1", quantity: 1 }] }))).status, 201);
    const blocked = await c.post("/api/orders", payload({ items: [{ sku: "LIM-1", quantity: 1 }] }));
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.error.code, "RATE_LIMITED");

    for (let i = 0; i < 3; i++) assert.equal((await c.post("/api/orders/track", { ref: "PH-AAAAAA", phone: "0712345678" })).status, 404);
    assert.equal((await c.post("/api/orders/track", { ref: "PH-AAAAAA", phone: "0712345678" })).status, 429);
  });
});

describe("admin: managing orders", () => {
  let server, admin, anon;
  const stock = async (sku) => (await server.pool.query("SELECT stock_count FROM products WHERE sku = ?", [sku]))[0][0].stock_count;
  const place = async (over) => (await anon.post("/api/orders", payload(over))).body;
  const idOf = async (ref) => (await server.pool.query("SELECT id FROM orders WHERE ref = ?", [ref]))[0][0].id;

  before(async () => {
    server = await startTestServer({ options: { orderLimit: 1000 } });
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras");
    await makeProduct(admin, { name: "Managed", sku: "MGD-1", price: 1000, stockCount: 10 });
    await makeProduct(admin, { name: "Untracked", sku: "MGD-2", price: 500 });
  });
  after(() => server.close());

  it("requires login for every order endpoint", async () => {
    for (const [m, u] of [["GET", "/api/admin/orders"], ["GET", "/api/admin/orders/1"], ["PATCH", "/api/admin/orders/1"], ["GET", "/api/admin/stats"]]) {
      assert.equal((await anon.request(m, u, m === "PATCH" ? { json: { status: "confirmed" } } : {})).status, 401, `${m} ${u}`);
    }
  });

  it("lists newest first with items, and filters by status / payment / search / page", async () => {
    const a = await place({ customer: { name: "Alice Mwangi", phone: "0711 111 111", address: "A" }, items: [{ sku: "MGD-1", quantity: 1 }] });
    const b = await place({ customer: { name: "Bob Otieno", phone: "+254 722 222 222", address: "B" }, items: [{ sku: "MGD-2", quantity: 1 }] });
    const c = await place({ customer: { name: "Carol Njeri", phone: "0733333333", address: "C" }, items: [{ sku: "MGD-2", quantity: 2 }] });
    await admin.patch(`/api/admin/orders/${await idOf(b.ref)}`, { status: "completed", paymentStatus: "paid" });

    const all = await admin.get("/api/admin/orders");
    assert.deepEqual(all.body.items.map((o) => o.ref), [c.ref, b.ref, a.ref], "newest first");
    assert.equal(all.body.total, 3);
    assert.equal(all.body.items[2].items[0].name, "Managed");
    assert.equal(all.body.items[0].customer.name, "Carol Njeri");

    assert.deepEqual((await admin.get("/api/admin/orders?status=completed")).body.items.map((o) => o.ref), [b.ref]);
    assert.deepEqual((await admin.get("/api/admin/orders?paymentStatus=pending")).body.items.map((o) => o.ref), [c.ref, a.ref]);
    assert.deepEqual((await admin.get(`/api/admin/orders?q=${a.ref.toLowerCase()}`)).body.items.map((o) => o.ref), [a.ref], "by reference");
    assert.deepEqual((await admin.get("/api/admin/orders?q=bob")).body.items.map((o) => o.ref), [b.ref], "by name");
    assert.deepEqual((await admin.get("/api/admin/orders?q=0722222")).body.items.map((o) => o.ref), [b.ref], "by phone typed locally");
    assert.deepEqual((await admin.get("/api/admin/orders?q=%2B254733333")).body.items.map((o) => o.ref), [c.ref], "by phone typed internationally");
    assert.equal((await admin.get("/api/admin/orders?q=%25")).body.total, 0, "wildcards are literal");

    const p1 = await admin.get("/api/admin/orders?limit=2&page=1");
    const p2 = await admin.get("/api/admin/orders?limit=2&page=2");
    assert.deepEqual([p1.body.items.length, p2.body.items.length, p1.body.totalPages], [2, 1, 2]);
    assert.equal((await admin.get("/api/admin/orders?status=weird")).status, 422);
    assert.equal((await admin.get("/api/admin/orders?limit=1000")).status, 422);
  });

  it("gets one order (404 when missing) and validates updates", async () => {
    const o = await place({ items: [{ sku: "MGD-2", quantity: 1 }] });
    const id = await idOf(o.ref);
    assert.equal((await admin.get(`/api/admin/orders/${id}`)).body.ref, o.ref);
    assert.equal((await admin.get("/api/admin/orders/99999")).status, 404);
    assert.equal((await admin.patch(`/api/admin/orders/${id}`, {})).status, 422);
    assert.equal((await admin.patch(`/api/admin/orders/${id}`, { status: "shipped" })).status, 422);
    assert.equal((await admin.patch(`/api/admin/orders/${id}`, { paymentStatus: "refunded" })).status, 422);
    assert.equal((await admin.patch("/api/admin/orders/99999", { status: "confirmed" })).status, 404);
    const ok = await admin.patch(`/api/admin/orders/${id}`, { status: "processing" });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.status, "processing");
    assert.equal(ok.body.paymentStatus, "pending", "untouched field stays");
  });

  it("cancelling returns the stock exactly once, then freezes the order", async () => {
    const before = await stock("MGD-1");
    const o = await place({ items: [{ sku: "MGD-1", quantity: 3 }, { sku: "MGD-2", quantity: 1 }] });
    assert.equal(await stock("MGD-1"), before - 3);
    const id = await idOf(o.ref);

    assert.equal((await admin.patch(`/api/admin/orders/${id}`, { status: "confirmed" })).status, 200);
    assert.equal(await stock("MGD-1"), before - 3, "other statuses don't touch stock");

    assert.equal((await admin.patch(`/api/admin/orders/${id}`, { status: "cancelled" })).status, 200);
    assert.equal(await stock("MGD-1"), before, "stock given back");
    assert.equal(await stock("MGD-2"), null, "untracked product stays untracked");

    const again = await admin.patch(`/api/admin/orders/${id}`, { status: "cancelled" });
    assert.equal(again.status, 409);
    assert.equal(again.body.error.code, "ORDER_CANCELLED");
    assert.equal((await admin.patch(`/api/admin/orders/${id}`, { status: "pending" })).status, 409);
    assert.equal((await admin.patch(`/api/admin/orders/${id}`, { paymentStatus: "paid" })).status, 409);
    assert.equal(await stock("MGD-1"), before, "no double restock");
  });

  it("doesn't restock into a product that has since stopped tracking stock", async () => {
    await makeProduct(admin, { name: "Was Tracked", sku: "MGD-3", price: 100, stockCount: 4 });
    const o = await place({ items: [{ sku: "MGD-3", quantity: 2 }] });
    await server.pool.query("UPDATE products SET stock_count = NULL WHERE sku = 'MGD-3'");
    await admin.patch(`/api/admin/orders/${await idOf(o.ref)}`, { status: "cancelled" });
    assert.equal(await stock("MGD-3"), null);
  });

  it("only restocks what checkout actually decremented", async () => {
    await makeProduct(admin, { name: "Later Tracked", sku: "MGD-4", price: 100 }); // untracked at order time
    const o = await place({ items: [{ sku: "MGD-4", quantity: 2 }] });
    await server.pool.query("UPDATE products SET stock_count = 10 WHERE sku = 'MGD-4'"); // admin starts tracking later
    await admin.patch(`/api/admin/orders/${await idOf(o.ref)}`, { status: "cancelled" });
    assert.equal(await stock("MGD-4"), 10, "no phantom stock created by the cancel");
  });
});

describe("admin overview numbers", () => {
  let server, admin, anon;
  before(async () => {
    server = await startTestServer({ options: { orderLimit: 1000, reviewLimit: 1000 } });
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras");
    await makeCategory(admin, "lenses");
    await makeProduct(admin, { name: "Low", sku: "ST-1", price: 1000, stockCount: 2 });
    await makeProduct(admin, { name: "Lowest", sku: "ST-2", price: 1000, stockCount: 0 });
    await makeProduct(admin, { name: "Plenty", sku: "ST-3", price: 1000, stockCount: 50 });
    await makeProduct(admin, { name: "Untracked", sku: "ST-4", price: 1000 });
  });
  after(() => server.close());

  it("counts orders, revenue, pending reviews and low stock", async () => {
    const empty = await admin.get("/api/admin/stats");
    assert.deepEqual([empty.body.products, empty.body.categories, empty.body.pendingOrders, empty.body.awaitingPayment, empty.body.revenue, empty.body.pendingReviews], [4, 2, 0, 0, 0, 0]);

    const o1 = (await anon.post("/api/orders", payload({ items: [{ sku: "ST-3", quantity: 2 }], deliveryFee: 500 }))).body; // 2500
    const o2 = (await anon.post("/api/orders", payload({ items: [{ sku: "ST-4", quantity: 1 }], deliveryFee: 0 }))).body; // 1000
    const o3 = (await anon.post("/api/orders", payload({ items: [{ sku: "ST-4", quantity: 3 }], deliveryFee: 0 }))).body; // 3000
    const id = async (ref) => (await server.pool.query("SELECT id FROM orders WHERE ref = ?", [ref]))[0][0].id;
    await admin.patch(`/api/admin/orders/${await id(o1.ref)}`, { paymentStatus: "paid", status: "completed" });
    await admin.patch(`/api/admin/orders/${await id(o3.ref)}`, { paymentStatus: "paid", status: "cancelled" }); // cancelled money isn't revenue
    await anon.post("/api/reviews", { productSku: "ST-4", customerName: "A", rating: 5, comment: "great" });
    await anon.post("/api/reviews", { productSku: "ST-4", customerName: "B", rating: 4, comment: "good" });

    const s = (await admin.get("/api/admin/stats")).body;
    assert.equal(s.pendingOrders, 1, "o2 only");
    assert.equal(s.awaitingPayment, 1, "o2 is unpaid; o3 is cancelled so it doesn't count");
    assert.equal(s.revenue, 2500, "paid and not cancelled");
    assert.equal(s.pendingReviews, 2);
    assert.deepEqual(s.lowStock.map((p) => [p.name, p.stockCount]), [["Lowest", 0], ["Low", 2]], "≤5 units, fewest first, untracked excluded");
    assert.equal(s.recentOrders.length, 3);
    assert.equal(s.recentOrders[0].ref, o3.ref);
    assert.ok(!("customerPhone" in s.recentOrders[0]));
    void o2;
  });
});
