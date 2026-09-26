import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { runMigrations } from "../src/migrate.js";
import { Client, makeCategory, makeProduct, signedInClient, startTestServer } from "./helpers.js";

describe("reviews (moderated)", () => {
  let server, admin, anon, product;
  before(async () => {
    server = await startTestServer({ options: { reviewLimit: 1000 } });
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras");
    product = await makeProduct(admin, { name: "Reviewed Cam", sku: "REV-1", price: 1000 });
  });
  after(() => server.close());

  const review = (over = {}) => ({ productSku: "REV-1", customerName: "Amina", rating: 5, comment: "Excellent camera", ...over });

  it("holds new reviews back until approved", async () => {
    const r = await anon.post("/api/reviews", review());
    assert.equal(r.status, 201);
    assert.equal((await anon.get("/api/reviews?sku=REV-1")).body.items.length, 0, "invisible while pending");

    const pending = await admin.get("/api/admin/reviews?approved=false");
    assert.equal(pending.body.total, 1);
    assert.equal(pending.body.pendingCount, 1);
    const item = pending.body.items[0];
    assert.equal(item.productName, "Reviewed Cam");
    assert.equal(item.productSku, "REV-1");
    assert.equal(item.approved, false);

    assert.equal((await admin.patch(`/api/admin/reviews/${item.id}`, { approved: true })).status, 204);
    const pub = await anon.get("/api/reviews?sku=REV-1");
    assert.deepEqual(pub.body.items.map((x) => [x.customerName, x.rating, x.comment]), [["Amina", 5, "Excellent camera"]]);
    assert.deepEqual(Object.keys(pub.body.items[0]).sort(), ["comment", "createdAt", "customerName", "id", "rating"], "public shape has no admin fields");

    assert.equal((await admin.patch(`/api/admin/reviews/${item.id}`, { approved: false })).status, 204);
    assert.equal((await anon.get("/api/reviews?sku=REV-1")).body.items.length, 0, "unpublish hides it again");
  });

  it("lists approved reviews newest first, per product only", async () => {
    await makeProduct(admin, { name: "Other", sku: "REV-2", price: 1 });
    const ids = [];
    for (const [sku, name] of [["REV-1", "First"], ["REV-1", "Second"], ["REV-2", "Elsewhere"]]) {
      await anon.post("/api/reviews", review({ productSku: sku, customerName: name }));
    }
    const all = await admin.get("/api/admin/reviews");
    for (const rv of all.body.items) { await admin.patch(`/api/admin/reviews/${rv.id}`, { approved: true }); ids.push(rv.id); }
    const rev1 = (await anon.get("/api/reviews?sku=REV-1")).body.items.map((x) => x.customerName);
    assert.ok(rev1.includes("First") && rev1.includes("Second") && !rev1.includes("Elsewhere"));
    assert.ok(rev1.indexOf("Second") < rev1.indexOf("First"), "newest first");
  });

  it("validates submissions", async () => {
    for (const body of [
      review({ rating: 0 }), review({ rating: 6 }), review({ rating: 3.5 }), review({ rating: "5" }),
      review({ customerName: "" }), review({ comment: "" }), review({ comment: "x".repeat(2001) }),
      review({ productSku: "" }), { productSku: "REV-1" },
    ]) {
      assert.equal((await anon.post("/api/reviews", body)).status, 422, JSON.stringify(body).slice(0, 80));
    }
    const unknown = await anon.post("/api/reviews", review({ productSku: "NOPE" }));
    assert.equal(unknown.status, 422);
    assert.equal((await anon.get("/api/reviews")).status, 422, "sku is required to list");
  });

  it("can't review an inactive product", async () => {
    await makeProduct(admin, { name: "Off", sku: "REV-OFF", price: 1, active: false });
    assert.equal((await anon.post("/api/reviews", review({ productSku: "REV-OFF" }))).status, 422);
  });

  it("admin moderation needs login; delete removes it for good", async () => {
    await anon.post("/api/reviews", review({ customerName: "Spammer" }));
    const list = (await admin.get("/api/admin/reviews?approved=false")).body.items;
    const spam = list.find((x) => x.customerName === "Spammer");
    for (const [m, u, body] of [["GET", "/api/admin/reviews"], ["PATCH", `/api/admin/reviews/${spam.id}`, { approved: true }], ["DELETE", `/api/admin/reviews/${spam.id}`]]) {
      assert.equal((await anon.request(m, u, body ? { json: body } : {})).status, 401, `${m} ${u}`);
    }
    assert.equal((await admin.del(`/api/admin/reviews/${spam.id}`)).status, 204);
    assert.equal((await admin.del(`/api/admin/reviews/${spam.id}`)).status, 404);
    assert.equal((await admin.patch("/api/admin/reviews/99999", { approved: true })).status, 404);
    assert.equal((await admin.patch(`/api/admin/reviews/${list[0].id}`, { approved: "yes" })).status, 422);
  });

  it("removes a product's reviews when the product is deleted", async () => {
    const p = await makeProduct(admin, { name: "Doomed", sku: "REV-DEL", price: 1 });
    await anon.post("/api/reviews", review({ productSku: "REV-DEL" }));
    await admin.del(`/api/admin/products/${p.id}`);
    const [[{ n }]] = await server.pool.query("SELECT COUNT(*) AS n FROM reviews WHERE product_id = ?", [p.id]);
    assert.equal(n, 0);
  });

  it("throttles review spam (429)", async () => {
    const s = await startTestServer({ options: { reviewLimit: 2 } });
    try {
      const a = await signedInClient(s);
      await makeCategory(a, "cameras");
      await makeProduct(a, { name: "P", sku: "REV-1", price: 1 });
      const c = new Client(s.base);
      assert.equal((await c.post("/api/reviews", review())).status, 201);
      assert.equal((await c.post("/api/reviews", review())).status, 201);
      assert.equal((await c.post("/api/reviews", review())).status, 429);
    } finally {
      await s.close();
    }
    void product;
  });
});

describe("product display ratings", () => {
  let server, admin;
  before(async () => {
    server = await startTestServer();
    admin = await signedInClient(server);
    await makeCategory(admin, "cameras");
  });
  after(() => server.close());

  it("stores rating/reviewCount, exposes them on the storefront, and can clear them", async () => {
    const p = await makeProduct(admin, { name: "Rated", sku: "RT-1", rating: 4.5, reviewCount: 12 });
    assert.equal(p.rating, 4.5);
    assert.equal(p.reviewCount, 12);
    const pub = await new Client(server.base).get(`/api/products/${p.slug}`);
    assert.equal(pub.body.rating, 4.5);
    assert.equal(pub.body.reviewCount, 12);
    const cleared = await admin.patch(`/api/admin/products/${p.id}`, { rating: null, reviewCount: null });
    assert.equal(cleared.body.rating, null);
    assert.equal(cleared.body.reviewCount, null);
    for (const bad of [{ rating: 5.5 }, { rating: -1 }, { rating: 4.55 }, { reviewCount: -1 }, { reviewCount: 1.5 }, { rating: "4" }]) {
      assert.equal((await admin.patch(`/api/admin/products/${p.id}`, bad)).status, 422, JSON.stringify(bad));
    }
  });
});

describe("homepage banners", () => {
  let server, admin, anon;
  const banner = (over = {}) => ({ headline: "Big sale", image: "https://images.example.com/a.jpg", ...over });
  before(async () => {
    server = await startTestServer();
    admin = await signedInClient(server);
    anon = new Client(server.base);
  });
  after(() => server.close());

  it("creates (appended last), updates, hides and deletes", async () => {
    const a = await admin.post("/api/admin/banners", banner({ headline: "A", eyebrow: "New", badge: "Deal", ctaLabel: "Shop", ctaHref: "/products?category=cameras", dealEndsAt: "2030-01-02T03:04:05.000Z" }));
    assert.equal(a.status, 201);
    assert.equal(a.body.order, 0);
    assert.equal(a.body.active, true);
    assert.equal(a.body.dealEndsAt, "2030-01-02T03:04:05.000Z", "deal end time round-trips as UTC");
    const b = await admin.post("/api/admin/banners", banner({ headline: "B", image: "/images/local.jpg" }));
    assert.equal(b.body.order, 1);
    const c = await admin.post("/api/admin/banners", banner({ headline: "C", active: false }));

    const upd = await admin.patch(`/api/admin/banners/${a.body.id}`, { headline: "A2", dealEndsAt: null, badge: null });
    assert.equal(upd.body.headline, "A2");
    assert.equal(upd.body.dealEndsAt, null);
    assert.equal(upd.body.badge, null);
    assert.equal(upd.body.eyebrow, "New", "untouched fields stay");
    assert.equal((await admin.patch(`/api/admin/banners/${a.body.id}`, {})).status, 422);
    assert.equal((await admin.patch("/api/admin/banners/99999", { headline: "x" })).status, 404);

    const pub = await anon.get("/api/banners");
    assert.deepEqual(pub.body.items.map((x) => x.headline), ["A2", "B"], "storefront: active only, in order");
    assert.equal((await admin.get("/api/admin/banners")).body.items.length, 3);

    assert.equal((await admin.del(`/api/admin/banners/${c.body.id}`)).status, 204);
    assert.equal((await admin.del(`/api/admin/banners/${c.body.id}`)).status, 404);
  });

  it("refuses dangerous URLs (javascript:, data:, protocol-relative) and bad input", async () => {
    for (const over of [
      { image: "javascript:alert(1)" }, { image: "data:text/html,<script>alert(1)</script>" }, { image: "//evil.example/x.jpg" }, { image: "ftp://x/y.jpg" }, { image: "relative.jpg" },
      { ctaHref: "javascript:alert(document.cookie)" }, { ctaHref: "//evil.example" }, { ctaHref: "data:text/html;base64,AAAA" },
      { headline: "" }, { headline: "x".repeat(201) }, { dealEndsAt: "tomorrow" }, { badge: "x".repeat(41) },
    ]) {
      const r = await admin.post("/api/admin/banners", banner(over));
      assert.equal(r.status, 422, JSON.stringify(over));
    }
    const patchBad = await admin.patch("/api/admin/banners/1", { ctaHref: "javascript:alert(1)" });
    assert.equal(patchBad.status, 422);
    assert.equal((await admin.post("/api/admin/banners", banner({ ctaHref: "https://example.com/deal" }))).status, 201);
    assert.equal((await admin.post("/api/admin/banners", banner({ ctaHref: "" }))).status, 201, "blank link is fine");
  });

  it("reorders (must list every banner exactly once)", async () => {
    const before = (await admin.get("/api/admin/banners")).body.items.map((b) => b.id);
    const reversed = [...before].reverse();
    const r = await admin.put("/api/admin/banners/order", { ids: reversed });
    assert.equal(r.status, 200);
    assert.deepEqual(r.body.items.map((b) => b.id), reversed);
    assert.deepEqual((await admin.get("/api/admin/banners")).body.items.map((b) => b.id), reversed);

    for (const ids of [reversed.slice(1), [...reversed, reversed[0]], [...reversed.slice(1), 99999], []]) {
      assert.equal((await admin.put("/api/admin/banners/order", { ids })).status, 422, JSON.stringify(ids));
    }
    assert.deepEqual((await admin.get("/api/admin/banners")).body.items.map((b) => b.id), reversed, "failed attempts change nothing");
  });

  it("admin endpoints need login; the public list doesn't", async () => {
    for (const [m, u, body] of [["GET", "/api/admin/banners"], ["POST", "/api/admin/banners", banner()], ["PUT", "/api/admin/banners/order", { ids: [1] }], ["PATCH", "/api/admin/banners/1", { headline: "x" }], ["DELETE", "/api/admin/banners/1"]]) {
      assert.equal((await anon.request(m, u, body ? { json: body } : {})).status, 401, `${m} ${u}`);
    }
    assert.equal((await anon.get("/api/banners")).status, 200);
  });
});

describe("bulk product import (CSV)", () => {
  let server, admin;
  before(async () => {
    server = await startTestServer();
    admin = await signedInClient(server);
    await makeCategory(admin, "cameras");
    await makeCategory(admin, "lenses");
  });
  after(() => server.close());

  it("creates new SKUs, updates existing ones, and reports bad rows without stopping", async () => {
    const existing = await makeProduct(admin, { name: "Old Name", sku: "B-1", price: 100, description: "Keep this description", badge: "New", stockCount: 7 });
    const r = await admin.post("/api/admin/products/bulk", {
      items: [
        { sku: "B-1", name: "New Name", category: "lenses", price: 250 }, // update
        { sku: "B-2", name: "Fresh One", category: "cameras", price: 500, brand: "Canon" }, // create
        { sku: "B-3", name: "Bad Category", category: "nope" },
        { sku: "B-4", category: "cameras" }, // missing name
        { sku: "B-5", name: "Bad Price", category: "cameras", price: -5 },
        "garbage",
        { sku: "B-6", name: "Also Fine", category: "cameras", price: null },
      ],
    });
    assert.equal(r.status, 200);
    assert.deepEqual([r.body.created, r.body.updated, r.body.errors.length], [2, 1, 4]);
    assert.deepEqual(r.body.errors.map((e) => e.row), [3, 4, 5, 6]);
    assert.ok(r.body.errors.every((e) => e.message.length > 0));

    const updated = (await admin.get(`/api/admin/products/${existing.id}`)).body;
    assert.equal(updated.name, "New Name");
    assert.equal(updated.category, "lenses");
    assert.equal(updated.price, 250);
    assert.equal(updated.description, "Keep this description", "fields the row didn't supply are untouched");
    assert.equal(updated.badge, "New");
    assert.equal(updated.stockCount, 7);
    assert.equal(updated.slug, existing.slug, "slug never changes");

    const fresh = (await admin.get("/api/admin/products?q=B-2")).body.items[0];
    assert.equal(fresh.brand, "Canon");
    assert.equal((await admin.get("/api/admin/products?q=B-6")).body.items[0].price, null);
    assert.equal((await admin.get("/api/admin/products?q=Bad")).body.total, 0, "rejected rows weren't created");
  });

  it("is idempotent, and validates the envelope", async () => {
    const items = [{ sku: "B-2", name: "Fresh One", category: "cameras", price: 500 }];
    const r = await admin.post("/api/admin/products/bulk", { items });
    assert.deepEqual([r.body.created, r.body.updated], [0, 1]);
    for (const body of [{}, { items: [] }, { items: "x" }, { items: new Array(501).fill({}) }]) {
      assert.equal((await admin.post("/api/admin/products/bulk", body)).status, 422);
    }
    assert.equal((await new Client(server.base).post("/api/admin/products/bulk", { items })).status, 401);
  });
});

describe("migrations", () => {
  let server, conn;
  before(async () => {
    server = await startTestServer();
    const { host, port, user, password, database } = server.config.db;
    conn = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  });
  after(async () => {
    await conn.end();
    await server.close();
  });

  it("is a no-op when already up to date", async () => {
    assert.deepEqual(await runMigrations(conn), []);
    const [rows] = await conn.query("SELECT name FROM schema_migrations ORDER BY name");
    assert.deepEqual(rows.map((r) => r.name), ["001_init.sql", "002_storefront.sql", "003_product_images.sql", "004_banner_images.sql"]);
  });

  it("safely adopts a database created before migrations were tracked", async () => {
    await conn.query("DROP TABLE schema_migrations");
    const ran = await runMigrations(conn);
    assert.deepEqual(ran, ["001_init.sql", "002_storefront.sql", "003_product_images.sql", "004_banner_images.sql"], "re-applies idempotently and records them");
    const [[{ n }]] = await conn.query("SELECT COUNT(*) AS n FROM admins");
    assert.equal(n, 1, "existing data untouched");
  });

  it("upgrades a v1 database in place: adds the new columns/tables and keeps its data", async () => {
    // Simulate a database that only ever ran migration 001 and already holds data.
    await conn.query("SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS order_items, orders, reviews, banners, schema_migrations; SET FOREIGN_KEY_CHECKS=1;");
    await conn.query("ALTER TABLE products DROP COLUMN IF EXISTS rating, DROP COLUMN IF EXISTS review_count");
    await conn.query("INSERT INTO categories (slug, name, short_name) VALUES ('legacy', 'Legacy', 'Legacy')");
    await conn.query(
      "INSERT INTO products (slug, sku, name, category_id, description) SELECT 'legacy-1', 'LEG-1', 'Legacy product', id, 'kept' FROM categories WHERE slug = 'legacy'"
    );
    await conn.query(
      "CREATE TABLE schema_migrations (name VARCHAR(120) NOT NULL PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    );
    await conn.query("INSERT INTO schema_migrations (name) VALUES ('001_init.sql')");

    assert.deepEqual(await runMigrations(conn), ["002_storefront.sql", "003_product_images.sql", "004_banner_images.sql"], "only the pending migration runs");

    const [[p]] = await conn.query("SELECT name, description, rating, review_count FROM products WHERE sku = 'LEG-1'");
    assert.deepEqual([p.name, p.description, p.rating, p.review_count], ["Legacy product", "kept", null, null]);
    for (const table of ["orders", "order_items", "reviews", "banners"]) await conn.query(`SELECT 1 FROM ${table} LIMIT 1`);
  });
});
