import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Client, makeCategory, makeProduct, signedInClient, startTestServer } from "./helpers.js";

describe("products (admin CRUD)", () => {
  let server, admin;
  before(async () => {
    server = await startTestServer();
    admin = await signedInClient(server);
    await makeCategory(admin, "cameras", { name: "Cameras" });
    await makeCategory(admin, "lenses", { name: "Camera Lenses" });
  });
  after(() => server.close());

  describe("create", () => {
    it("creates a product in the storefront shape, deriving the slug", async () => {
      const r = await admin.post("/api/admin/products", {
        name: "Canon EOS R50 Body",
        sku: "CAN-R50V-BODY",
        category: "cameras",
        brand: "Canon",
        price: 77999,
        description: "Mirrorless body",
        specs: [{ label: "Sensor", value: "APS-C" }],
        badge: "New",
        stockCount: 4,
      });
      assert.equal(r.status, 201);
      assert.equal(r.body.slug, "canon-eos-r50-body-can-r50v-body");
      assert.equal(r.body.category, "cameras");
      assert.equal(r.body.categoryName, "Cameras");
      assert.equal(r.body.price, 77999);
      assert.deepEqual(r.body.specs, [{ label: "Sensor", value: "APS-C" }]);
      assert.equal(r.body.inStock, true);
      assert.equal(r.body.active, true);
      assert.equal(r.body.featured, false);
      assert.deepEqual(r.body.images, []);
      assert.equal(r.body.imageDir, null);
    });

    it("allows price on request (null) and a custom slug", async () => {
      const r = await admin.post("/api/admin/products", { name: "POA Thing", sku: "POA-1", category: "cameras", price: null, slug: "custom-slug" });
      assert.equal(r.status, 201);
      assert.equal(r.body.price, null);
      assert.equal(r.body.slug, "custom-slug");
    });

    it("rejects invalid input (422) without touching the DB", async () => {
      const bad = [
        [{ sku: "X-1", category: "cameras" }, "name"],
        [{ name: "n", category: "cameras" }, "sku"],
        [{ name: "n", sku: "X-2" }, "category"],
        [{ name: "n", sku: "X-3", category: "cameras", price: -5 }, "price"],
        [{ name: "n", sku: "X-4", category: "cameras", price: "1000" }, "price"], // strings aren't coerced
        [{ name: "n", sku: "X-5", category: "cameras", price: 12.5 }, "price"],
        [{ name: "n", sku: "bad sku!", category: "cameras" }, "sku"],
        [{ name: "n", sku: "X-6", category: "cameras", badge: "Hot" }, "badge"],
        [{ name: "n", sku: "X-7", category: "cameras", specs: [{ label: "", value: "x" }] }, "specs.0.label"],
        [{ name: "n", sku: "X-8", category: "cameras", slug: "Not A Slug" }, "slug"],
      ];
      for (const [body, path] of bad) {
        const r = await admin.post("/api/admin/products", body);
        assert.equal(r.status, 422, JSON.stringify(body));
        assert.ok(r.body.error.details.some((d) => d.path === path), `expected error at "${path}": ${JSON.stringify(r.body.error.details)}`);
      }
      const [rows] = await server.pool.query("SELECT COUNT(*) AS n FROM products WHERE sku LIKE 'X-%'");
      assert.equal(rows[0].n, 0);
    });

    it("422s an unknown category and 409s a duplicate SKU", async () => {
      const unknown = await admin.post("/api/admin/products", { name: "n", sku: "U-1", category: "nope" });
      assert.equal(unknown.status, 422);
      assert.equal(unknown.body.error.details[0].path, "category");

      await makeProduct(admin, { sku: "DUP-1" });
      const dup = await admin.post("/api/admin/products", { name: "Other", sku: "DUP-1", category: "cameras" });
      assert.equal(dup.status, 409);
      assert.deepEqual(dup.body.error.details, { field: "sku" });
    });
  });

  describe("update", () => {
    it("PATCH { price } changes only the price (no defaults clobber other fields)", async () => {
      const p = await makeProduct(admin, {
        description: "Keep me",
        specs: [{ label: "A", value: "B" }],
        badge: "Sale",
        featured: true,
        stockCount: 3,
        inStock: false,
        brand: "Sony",
        color: "Black",
        compareAtPrice: 2000,
      });
      const r = await admin.patch(`/api/admin/products/${p.id}`, { price: 79999 });
      assert.equal(r.status, 200);
      assert.equal(r.body.price, 79999);
      for (const k of ["description", "specs", "badge", "featured", "stockCount", "inStock", "brand", "color", "compareAtPrice", "sku", "slug", "name"]) {
        assert.deepEqual(r.body[k], p[k], `${k} must be unchanged`);
      }
    });

    it("updates many fields, can null things out, and moves category", async () => {
      const p = await makeProduct(admin, { brand: "X", badge: "New", stockCount: 5 });
      const r = await admin.patch(`/api/admin/products/${p.id}`, {
        name: "Renamed",
        brand: null,
        badge: null,
        stockCount: null,
        price: null,
        category: "lenses",
        active: false,
        adminNotes: "check model",
        specs: [],
      });
      assert.equal(r.status, 200);
      assert.equal(r.body.name, "Renamed");
      assert.equal(r.body.brand, null);
      assert.equal(r.body.badge, null);
      assert.equal(r.body.stockCount, null);
      assert.equal(r.body.price, null);
      assert.equal(r.body.category, "lenses");
      assert.equal(r.body.active, false);
      assert.equal(r.body.adminNotes, "check model");
    });

    it("rejects: empty body, bad values, unknown fields are ignored, missing product, bad id", async () => {
      const p = await makeProduct(admin);
      assert.equal((await admin.patch(`/api/admin/products/${p.id}`, {})).status, 422);
      assert.equal((await admin.patch(`/api/admin/products/${p.id}`, { price: -1 })).status, 422);
      assert.equal((await admin.patch(`/api/admin/products/${p.id}`, { category: "nope" })).status, 422);
      assert.equal((await admin.patch("/api/admin/products/999999", { price: 1 })).status, 404);
      assert.equal((await admin.patch("/api/admin/products/abc", { price: 1 })).status, 422);
      // slug / imageFolder / id are not updatable: the request is a no-op → 422 "no fields"
      const r = await admin.patch(`/api/admin/products/${p.id}`, { slug: "hijack", id: 1, imageDir: "x/y" });
      assert.equal(r.status, 422);
      assert.equal((await admin.get(`/api/admin/products/${p.id}`)).body.slug, p.slug);
    });

    it("409s when a SKU change collides", async () => {
      const a = await makeProduct(admin, { sku: "COLLIDE-A" });
      await makeProduct(admin, { sku: "COLLIDE-B" });
      const r = await admin.patch(`/api/admin/products/${a.id}`, { sku: "COLLIDE-B" });
      assert.equal(r.status, 409);
      assert.deepEqual(r.body.error.details, { field: "sku" });
    });
  });

  it("deletes a product (204, then 404) and leaves other products alone", async () => {
    const keep = await makeProduct(admin);
    const gone = await makeProduct(admin);
    assert.equal((await admin.del(`/api/admin/products/${gone.id}`)).status, 204);
    assert.equal((await admin.get(`/api/admin/products/${gone.id}`)).status, 404);
    assert.equal((await admin.del(`/api/admin/products/${gone.id}`)).status, 404);
    assert.equal((await admin.get(`/api/admin/products/${keep.id}`)).status, 200);
  });
});

describe("storefront API: visibility, search, filters, sorting, paging", () => {
  let server, admin, anon;
  before(async () => {
    server = await startTestServer();
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras", { name: "Cameras", sortOrder: 1 });
    await makeCategory(admin, "tvs", { name: "TVs", sortOrder: 2 });
    await makeCategory(admin, "hidden", { name: "Hidden Dept", active: false });

    const seed = [
      { sku: "CAN-R50", name: "Canon EOS R50 Body", category: "cameras", brand: "Canon", price: 77999, stockCount: 3, featured: true, featureRank: 2 },
      { sku: "CAN-R8", name: "Canon EOS R8 Body", category: "cameras", brand: "Canon", price: 148999, stockCount: 0 },
      { sku: "SNY-A6700", name: "Sony a6700 Body", category: "cameras", brand: "Sony", price: 159999, featured: true, featureRank: 1 },
      { sku: "SNY-TV55", name: 'Sony 55" X85L 4K TV', category: "tvs", brand: "Sony", price: 114999, description: "Google TV, 100% genuine" },
      { sku: "SAM-TV50", name: 'Samsung 50" CU8000', category: "tvs", brand: "Samsung", price: 63999 },
      { sku: "POA-1", name: "Mystery Camera", category: "cameras", price: null },
      { sku: "OFF-1", name: "Discontinued Cam", category: "cameras", price: 5000, active: false },
      { sku: "HID-1", name: "In Hidden Category", category: "hidden", price: 100 },
    ];
    for (const s of seed) await makeProduct(admin, s);
  });
  after(() => server.close());

  const names = (r) => r.body.items.map((p) => p.name);

  it("hides inactive products and products in inactive categories", async () => {
    const r = await anon.get("/api/products?limit=100");
    assert.equal(r.status, 200);
    assert.equal(r.body.total, 6);
    assert.ok(!names(r).includes("Discontinued Cam"));
    assert.ok(!names(r).includes("In Hidden Category"));
    assert.equal((await anon.get("/api/products/" + (await admin.get("/api/admin/products?q=Discontinued")).body.items[0].slug)).status, 404);

    const adminView = await admin.get("/api/admin/products?limit=100");
    assert.equal(adminView.body.total, 8, "admin sees everything");
    assert.equal((await admin.get("/api/admin/products?active=false")).body.total, 1, "active=false filter (admin only)");
  });

  it("doesn't leak admin-only fields to the storefront", async () => {
    const r = await anon.get("/api/products?limit=1");
    const p = r.body.items[0];
    for (const k of ["active", "adminNotes", "imageDir", "createdAt", "updatedAt"]) assert.ok(!(k in p), `${k} leaked`);
  });

  it("gets one product by slug; 404 for unknown/garbage slugs", async () => {
    const list = await anon.get("/api/products?q=r50");
    const one = await anon.get(`/api/products/${list.body.items[0].slug}`);
    assert.equal(one.status, 200);
    assert.equal(one.body.sku, "CAN-R50");
    for (const bad of ["nope", "../etc/passwd", "%00", "A%20B"]) {
      assert.equal((await anon.get(`/api/products/${bad}`)).status, 404, bad);
    }
  });

  it("searches all terms (AND) across name/sku/brand/description/category", async () => {
    assert.deepEqual(names(await anon.get("/api/products?q=canon+body&sort=name")), ["Canon EOS R50 Body", "Canon EOS R8 Body"]);
    assert.deepEqual(names(await anon.get("/api/products?q=canon+r8")), ["Canon EOS R8 Body"]);
    assert.deepEqual(names(await anon.get("/api/products?q=SNY-A6700")), ["Sony a6700 Body"]); // by SKU
    assert.deepEqual(names(await anon.get("/api/products?q=genuine")), ['Sony 55" X85L 4K TV']); // by description
    assert.deepEqual(names(await anon.get("/api/products?q=samsung&category=tvs")), ['Samsung 50" CU8000']);
    assert.equal((await anon.get("/api/products?q=zzz-nothing")).body.total, 0);
  });

  it("treats % _ and quotes in the query literally (no wildcard/SQL injection)", async () => {
    assert.equal((await anon.get("/api/products?q=%25")).body.total, 1, '"%" only matches the "100%" in a description');
    assert.equal((await anon.get("/api/products?q=_")).body.total, 0);
    const inj = await anon.get("/api/products?q=" + encodeURIComponent("'; DROP TABLE products; --"));
    assert.equal(inj.status, 200);
    assert.equal(inj.body.total, 0);
    assert.equal((await anon.get("/api/products?category=" + encodeURIComponent("cameras' OR '1'='1"))).body.total, 0);
    assert.equal((await anon.get("/api/products?limit=100")).body.total, 6, "table is intact");
  });

  it("filters by category, brand, price range and stock", async () => {
    assert.equal((await anon.get("/api/products?category=tvs")).body.total, 2);
    assert.equal((await anon.get("/api/products?category=hidden")).body.total, 0);
    assert.equal((await anon.get("/api/products?brand=sony")).body.total, 2, "brand match is case-insensitive");
    assert.deepEqual(names(await anon.get("/api/products?minPrice=100000&maxPrice=150000&sort=name")), ['Canon EOS R8 Body', 'Sony 55" X85L 4K TV']);
    // price filters exclude "price on request"
    assert.ok(!names(await anon.get("/api/products?minPrice=0&limit=100")).includes("Mystery Camera"));
    const inStock = names(await anon.get("/api/products?inStock=true&limit=100"));
    assert.ok(!inStock.includes("Canon EOS R8 Body"), "stockCount 0 is out of stock");
    assert.ok(inStock.includes("Canon EOS R50 Body"));
    assert.deepEqual(names(await anon.get("/api/products?featured=true")), ["Sony a6700 Body", "Canon EOS R50 Body"], "featureRank orders featured items");
  });

  it("sorts: featured (default), price asc/desc (price-on-request last), name, newest", async () => {
    assert.deepEqual(names(await anon.get("/api/products?sort=price-asc&limit=3")), ['Samsung 50" CU8000', "Canon EOS R50 Body", 'Sony 55" X85L 4K TV']);
    const desc = names(await anon.get("/api/products?sort=price-desc&limit=100"));
    assert.equal(desc[0], "Sony a6700 Body");
    assert.equal(desc.at(-1), "Mystery Camera");
    const asc = names(await anon.get("/api/products?sort=price-asc&limit=100"));
    assert.equal(asc.at(-1), "Mystery Camera");
    assert.deepEqual(names(await anon.get("/api/products?sort=name&limit=2")), ["Canon EOS R50 Body", "Canon EOS R8 Body"]);
    assert.equal((await anon.get("/api/products?sort=newest&limit=1")).body.items[0].name, "Mystery Camera", "newest visible product");
    // default: featured first, by rank
    assert.deepEqual(names(await anon.get("/api/products?limit=2")), ["Sony a6700 Body", "Canon EOS R50 Body"]);
  });

  it("paginates with totals", async () => {
    const p1 = await anon.get("/api/products?sort=name&limit=4&page=1");
    const p2 = await anon.get("/api/products?sort=name&limit=4&page=2");
    const p3 = await anon.get("/api/products?sort=name&limit=4&page=3");
    assert.equal(p1.body.total, 6);
    assert.equal(p1.body.totalPages, 2);
    assert.equal(p1.body.items.length, 4);
    assert.equal(p2.body.items.length, 2);
    assert.equal(p3.body.items.length, 0);
    const seen = new Set([...names(p1), ...names(p2)]);
    assert.equal(seen.size, 6, "no overlap or gaps between pages");
  });

  it("validates query parameters (422) instead of passing them to SQL", async () => {
    for (const q of ["sort=price;DROP", "sort=random", "limit=0", "limit=201", "limit=abc", "page=0", "minPrice=-1", "inStock=maybe"]) {
      const r = await anon.get(`/api/products?${q}`);
      assert.equal(r.status, 422, q);
      assert.equal(r.body.error.code, "VALIDATION_ERROR");
    }
  });

  it("public categories show active departments with active-product counts", async () => {
    const r = await anon.get("/api/categories");
    const byslug = Object.fromEntries(r.body.items.map((c) => [c.slug, c]));
    assert.equal(byslug.cameras.productCount, 4);
    assert.equal(byslug.tvs.productCount, 2);
    assert.ok(!byslug.hidden);
    assert.deepEqual(r.body.items.map((c) => c.slug), ["cameras", "tvs"]);
  });

  it("answers malformed URLs and oversized bodies with 4xx, never 500", async () => {
    const badPath = await fetch(`${server.base}/api/products/%E0%A4%A`);
    assert.equal(badPath.status, 400);
    assert.equal((await badPath.json()).error.code, "BAD_REQUEST");
    assert.equal((await fetch(`${server.base}/images/p/%E0%A4%A`)).status, 400);

    const big = await anon.post("/api/admin/auth/login", { email: "a".repeat(200_000), password: "x" });
    assert.equal(big.status, 413);
    const noBody = await anon.request("POST", "/api/admin/auth/login", { raw: "x", headers: { "content-type": "text/plain" } });
    assert.equal(noBody.status, 422);
  });

  it("health check reports the database", async () => {
    const r = await anon.get("/api/health");
    assert.deepEqual(r.body, { status: "ok", db: "up" });
  });

  it("unknown routes return a JSON 404", async () => {
    const r = await anon.get("/api/nope");
    assert.equal(r.status, 404);
    assert.equal(r.body.error.code, "NOT_FOUND");
  });
});
