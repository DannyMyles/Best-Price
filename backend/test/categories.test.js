import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Client, makeCategory, makeProduct, signedInClient, startTestServer } from "./helpers.js";

describe("categories (admin CRUD)", () => {
  let server, admin;
  before(async () => {
    server = await startTestServer();
    admin = await signedInClient(server);
  });
  after(() => server.close());

  it("creates with defaults and returns the storefront shape", async () => {
    const r = await admin.post("/api/admin/categories", { slug: "cameras", name: "Cameras" });
    assert.equal(r.status, 201);
    assert.match(r.headers.get("location"), /\/api\/admin\/categories\/\d+$/);
    assert.deepEqual(
      { slug: r.body.slug, name: r.body.name, shortName: r.body.shortName, icon: r.body.icon, order: r.body.order, active: r.body.active, productCount: r.body.productCount },
      { slug: "cameras", name: "Cameras", shortName: "Cameras", icon: "package", order: 0, active: true, productCount: 0 }
    );
  });

  it("rejects bad input with 422 + field details", async () => {
    for (const body of [{ slug: "Bad Slug!", name: "x" }, { slug: "ok", name: "" }, { slug: "-lead", name: "x" }, { name: "no slug" }]) {
      const r = await admin.post("/api/admin/categories", body);
      assert.equal(r.status, 422, JSON.stringify(body));
      assert.equal(r.body.error.code, "VALIDATION_ERROR");
      assert.ok(Array.isArray(r.body.error.details) && r.body.error.details.length > 0);
    }
  });

  it("returns 409 for a duplicate slug", async () => {
    const r = await admin.post("/api/admin/categories", { slug: "cameras", name: "Again" });
    assert.equal(r.status, 409);
    assert.equal(r.body.error.code, "DUPLICATE");
    assert.deepEqual(r.body.error.details, { field: "slug" });
  });

  it("updates partially, slug stays immutable", async () => {
    const c = await makeCategory(admin, "tvs", { name: "TVs", sortOrder: 5 });
    const r = await admin.patch(`/api/admin/categories/${c.id}`, { name: "Televisions", slug: "hacked", active: false });
    assert.equal(r.status, 200);
    assert.equal(r.body.name, "Televisions");
    assert.equal(r.body.active, false);
    assert.equal(r.body.slug, "tvs", "slug is not updatable");
    assert.equal(r.body.order, 5, "untouched fields keep their value");
    assert.equal((await admin.patch(`/api/admin/categories/${c.id}`, {})).status, 422);
    assert.equal((await admin.patch("/api/admin/categories/99999", { name: "x" })).status, 404);
  });

  it("public list hides inactive categories; admin list shows all", async () => {
    const pub = await new Client(server.base).get("/api/categories");
    const slugs = pub.body.items.map((c) => c.slug);
    assert.ok(slugs.includes("cameras"));
    assert.ok(!slugs.includes("tvs"), "inactive category is hidden from the storefront");
    assert.ok(!("active" in pub.body.items[0]), "no admin-only fields on the public list");

    const all = await admin.get("/api/admin/categories");
    assert.ok(all.body.items.map((c) => c.slug).includes("tvs"));
  });

  it("orders by sortOrder then name", async () => {
    await makeCategory(admin, "zz-first", { name: "ZZ", sortOrder: -1 });
    await makeCategory(admin, "aa-last", { name: "AA", sortOrder: 99 });
    const r = await admin.get("/api/admin/categories");
    const slugs = r.body.items.map((c) => c.slug);
    assert.equal(slugs[0], "zz-first");
    assert.equal(slugs.at(-1), "aa-last");
  });

  describe("deleting", () => {
    it("removes an empty category (204, then 404)", async () => {
      const c = await makeCategory(admin, "empty-one");
      assert.equal((await admin.del(`/api/admin/categories/${c.id}`)).status, 204);
      assert.equal((await admin.get(`/api/admin/categories/${c.id}`)).status, 404);
      assert.equal((await admin.del(`/api/admin/categories/${c.id}`)).status, 404);
    });

    it("refuses when products exist unless you say where they go", async () => {
      const src = await makeCategory(admin, "src-cat");
      const dst = await makeCategory(admin, "dst-cat");
      const p1 = await makeProduct(admin, { category: "src-cat" });
      const p2 = await makeProduct(admin, { category: "src-cat" });

      const blocked = await admin.del(`/api/admin/categories/${src.id}`);
      assert.equal(blocked.status, 409);
      assert.equal(blocked.body.error.code, "CATEGORY_IN_USE");
      assert.equal(blocked.body.error.details.productCount, 2);
      assert.equal((await admin.get(`/api/admin/products/${p1.id}`)).status, 200, "nothing was deleted");

      assert.equal((await admin.del(`/api/admin/categories/${src.id}?reassignTo=src-cat`)).status, 422, "can't reassign to itself");
      assert.equal((await admin.del(`/api/admin/categories/${src.id}?reassignTo=nope`)).status, 422, "unknown target");
      assert.equal((await admin.del(`/api/admin/categories/${src.id}?reassignTo=BAD%20SLUG`)).status, 422);

      const ok = await admin.del(`/api/admin/categories/${src.id}?reassignTo=dst-cat`);
      assert.equal(ok.status, 204);
      for (const p of [p1, p2]) {
        const moved = await admin.get(`/api/admin/products/${p.id}`);
        assert.equal(moved.body.category, "dst-cat");
      }
      const list = await admin.get("/api/admin/categories");
      assert.equal(list.body.items.find((c) => c.slug === "dst-cat").productCount, 2);
      assert.ok(!list.body.items.some((c) => c.slug === "src-cat"));
      void dst;
    });
  });
});
