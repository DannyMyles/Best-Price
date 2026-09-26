import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Client, fakeJpgActuallyText, gif, jpeg, makeCategory, makeProduct, png, signedInClient, startTestServer, webp } from "./helpers.js";

describe("product images stored in the database", () => {
  let server, admin, anon;

  const imgs = async (id) => (await admin.get(`/api/admin/products/${id}/images`)).body.images;
  const files = async (id) => (await imgs(id)).map((i) => i.file);

  before(async () => {
    server = await startTestServer({ env: { MAX_UPLOAD_MB: "0.1" } }); // 100 KB cap for the size test
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras", { name: "Cameras" });
  });
  after(() => server.close());

  describe("upload, list, serve", () => {
    it("stores bytes in MariaDB, lists in order, and serves them back with the right type", async () => {
      const p = await makeProduct(admin, { name: "Stored Cam" });
      assert.deepEqual(await imgs(p.id), [], "no photos yet is an empty list");

      const up = await admin.upload(`/api/admin/products/${p.id}/images`, [
        { buffer: jpeg(100), name: "a.jpg" },
        { buffer: png(200), name: "b.png" },
        { buffer: webp(300), name: "c.webp" },
      ]);
      assert.equal(up.status, 201);
      assert.deepEqual(up.body.images.map((i) => i.position), [1, 2, 3]);
      assert.match(up.body.images[0].url, /\/images\/p\/\d+\?v=\d+$/);

      const [rows] = await server.pool.query("SELECT COUNT(*) AS n FROM product_images WHERE product_id = ?", [p.id]);
      assert.equal(rows[0].n, 3);

      const types = [];
      for (const img of up.body.images) {
        const r = await fetch(img.url);
        assert.equal(r.status, 200);
        types.push(r.headers.get("content-type"));
      }
      assert.deepEqual(types, ["image/jpeg", "image/png", "image/webp"]);
      const cache = (await fetch(up.body.images[0].url)).headers.get("cache-control");
      assert.match(cache, /immutable/);
    });

    it("downloaded bytes equal uploaded bytes", async () => {
      const p = await makeProduct(admin, { name: "Byte Exact" });
      const original = jpeg(500);
      const up = await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: original, name: "x.jpg" }]);
      const got = Buffer.from(await (await fetch(up.body.images[0].url)).arrayBuffer());
      assert.ok(got.equals(original));
    });

    it("storefront product lists include the photo URLs (primary first) without loading blobs", async () => {
      const p = await makeProduct(admin, { name: "Listed Cam", sku: "LIST-1" });
      await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(10) }, { buffer: png(11) }]);
      const one = await anon.get(`/api/products/${p.slug}`);
      assert.equal(one.body.images.length, 2);
      const list = await anon.get("/api/products?q=Listed");
      assert.deepEqual(list.body.items[0].images, one.body.images);
    });

    it("unknown, non-numeric and deleted ids 404", async () => {
      assert.equal((await fetch(`${server.base}/images/p/99999999`)).status, 404);
      assert.equal((await fetch(`${server.base}/images/p/abc`)).status, 404);
      assert.equal((await fetch(`${server.base}/images/p/1.jpg`)).status, 404);
    });

    it("the old folder-style URLs are gone", async () => {
      assert.equal((await fetch(`${server.base}/images/01_cameras/Foo/Foo%20-%201.jpg`)).status, 404);
    });
  });

  describe("validation", () => {
    it("rejects files that aren't really JPEG/PNG/WebP — even with an image filename — and stores nothing", async () => {
      const p = await makeProduct(admin, { name: "Bad Upload" });
      const r = await admin.upload(`/api/admin/products/${p.id}/images`, [
        { buffer: jpeg(50), name: "ok.jpg" },
        { buffer: fakeJpgActuallyText(), name: "evil.jpg" },
      ]);
      assert.equal(r.status, 415);
      assert.deepEqual(await imgs(p.id), []);
      assert.equal((await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: gif(), name: "g.jpg" }])).status, 415);
    });

    it("enforces the size limit (413) and requires at least one file (422)", async () => {
      const p = await makeProduct(admin, { name: "Size Test" });
      assert.equal((await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(200_000) }])).status, 413);
      assert.equal((await admin.upload(`/api/admin/products/${p.id}/images`, [])).status, 422);
    });

    it("caps images per product", async () => {
      const p = await makeProduct(admin, { name: "Cap Test" });
      for (let i = 0; i < 3; i++) {
        const r = await admin.upload(`/api/admin/products/${p.id}/images`, Array.from({ length: 10 }, () => ({ buffer: jpeg(20) })));
        assert.equal(r.status, 201);
      }
      const over = await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(20) }]);
      assert.equal(over.status, 409);
      assert.equal(over.body.error.code, "TOO_MANY_IMAGES");
      assert.equal((await imgs(p.id)).length, 30);
    });

    it("parallel uploads never lose or duplicate positions", async () => {
      const p = await makeProduct(admin, { name: "Parallel" });
      const results = await Promise.all(
        Array.from({ length: 6 }, () => admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(30) }]))
      );
      assert.ok(results.every((r) => r.status === 201));
      const list = await imgs(p.id);
      assert.deepEqual(list.map((i) => i.position), [1, 2, 3, 4, 5, 6]);
      assert.equal(new Set(list.map((i) => i.file)).size, 6);
    });

    it("404s for a product that doesn't exist", async () => {
      assert.equal((await admin.upload("/api/admin/products/999999/images", [{ buffer: jpeg(20) }])).status, 404);
      assert.equal((await admin.get("/api/admin/products/999999/images")).status, 404);
    });
  });

  describe("reorder & delete", () => {
    it("reorders; the first becomes the primary image", async () => {
      const p = await makeProduct(admin, { name: "Reorder" });
      const up = await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(41) }, { buffer: png(42) }, { buffer: webp(43) }]);
      const [a, b, c] = up.body.images.map((i) => i.file);
      const r = await admin.put(`/api/admin/products/${p.id}/images/order`, { files: [c, a, b] });
      assert.equal(r.status, 200);
      assert.deepEqual(r.body.images.map((i) => i.file), [c, a, b]);
      assert.deepEqual(r.body.images.map((i) => i.position), [1, 2, 3]);
      const shop = await anon.get(`/api/products/${p.slug}`);
      assert.equal(shop.body.images[0].split("?")[0], r.body.images[0].url.split("?")[0]);
    });

    it("rejects lists that aren't an exact permutation, and changes nothing", async () => {
      const p = await makeProduct(admin, { name: "Bad Reorder" });
      const up = await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(41) }, { buffer: png(42) }]);
      const [a, b] = up.body.images.map((i) => i.file);
      for (const files of [[a], [a, a], [a, b, "999"], [a, "999"], ["x", "y"]]) {
        assert.equal((await admin.put(`/api/admin/products/${p.id}/images/order`, { files })).status, 422, JSON.stringify(files));
      }
      assert.deepEqual(await files(p.id), [a, b]);
    });

    it("deleting removes exactly that image and closes the gap", async () => {
      const p = await makeProduct(admin, { name: "Delete One" });
      const up = await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(41) }, { buffer: png(42) }, { buffer: webp(43) }]);
      const [a, b, c] = up.body.images.map((i) => i.file);
      const r = await admin.del(`/api/admin/products/${p.id}/images/${a}`);
      assert.equal(r.status, 200);
      assert.deepEqual(r.body.images.map((i) => [i.file, i.position]), [[b, 1], [c, 2]]);
      assert.equal((await fetch(up.body.images[0].url)).status, 404);
    });

    it("can't delete another product's image or something that doesn't exist", async () => {
      const p1 = await makeProduct(admin, { name: "Owner One" });
      const p2 = await makeProduct(admin, { name: "Owner Two" });
      const up = await admin.upload(`/api/admin/products/${p1.id}/images`, [{ buffer: jpeg(41) }]);
      const id = up.body.images[0].file;
      assert.equal((await admin.del(`/api/admin/products/${p2.id}/images/${id}`)).status, 404);
      assert.equal((await admin.del(`/api/admin/products/${p1.id}/images/nope`)).status, 404);
      assert.equal((await admin.del(`/api/admin/products/${p1.id}/images/9999999`)).status, 404);
      assert.equal((await imgs(p1.id)).length, 1);
      assert.equal((await admin.put(`/api/admin/products/${p2.id}/images/order`, { files: [id] })).status, 422);
    });
  });

  it("public categories expose an image taken from a product in that category", async () => {
    await makeCategory(admin, "tvs", { name: "TVs" });
    const empty = await anon.get("/api/categories");
    assert.equal(empty.body.items.find((c) => c.slug === "tvs").image, null);
    const plain = await makeProduct(admin, { name: "Plain TV", category: "tvs" });
    const star = await makeProduct(admin, { name: "Star TV", category: "tvs", featured: true });
    await admin.upload(`/api/admin/products/${plain.id}/images`, [{ buffer: jpeg(21) }]);
    const up = await admin.upload(`/api/admin/products/${star.id}/images`, [{ buffer: png(22) }, { buffer: jpeg(23) }]);
    const cat = (await anon.get("/api/categories")).body.items.find((c) => c.slug === "tvs");
    assert.equal(cat.image, up.body.images[0].url, "featured product's primary photo wins");
    assert.equal((await fetch(cat.image)).status, 200);
  });

  it("deleting a product deletes its stored photos", async () => {
    const p = await makeProduct(admin, { name: "Gone Soon" });
    const up = await admin.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(41) }]);
    assert.equal((await admin.del(`/api/admin/products/${p.id}`)).status, 204);
    const [[{ n }]] = await server.pool.query("SELECT COUNT(*) AS n FROM product_images WHERE product_id = ?", [p.id]);
    assert.equal(n, 0);
    assert.equal((await fetch(up.body.images[0].url)).status, 404);
  });

  it("all image admin routes require login", async () => {
    const p = await makeProduct(admin, { name: "Auth Test" });
    assert.equal((await anon.get(`/api/admin/products/${p.id}/images`)).status, 401);
    assert.equal((await anon.upload(`/api/admin/products/${p.id}/images`, [{ buffer: jpeg(20) }])).status, 401);
    assert.equal((await anon.put(`/api/admin/products/${p.id}/images/order`, { files: ["1"] })).status, 401);
    assert.equal((await anon.del(`/api/admin/products/${p.id}/images/1`)).status, 401);
  });
});
