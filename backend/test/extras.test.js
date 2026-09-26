import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { ADMIN, Client, jpeg, makeCategory, makeProduct, png, signedInClient, startTestServer } from "./helpers.js";

describe("admin users", () => {
  let server, admin, anon;
  before(async () => {
    server = await startTestServer();
    admin = await signedInClient(server);
    anon = new Client(server.base);
  });
  after(() => server.close());

  it("requires login", async () => {
    assert.equal((await anon.get("/api/admin/admins")).status, 401);
    assert.equal((await anon.post("/api/admin/admins", {})).status, 401);
  });

  it("creates an admin who can sign in; hashes never leak; duplicates 409", async () => {
    const r = await admin.post("/api/admin/admins", { email: "Second@Test.Local", name: "Second", password: "another-long-pass" });
    assert.equal(r.status, 201);
    assert.equal(r.body.email, "second@test.local");
    assert.ok(!JSON.stringify(r.body).includes("password"));
    const c = new Client(server.base);
    assert.equal((await c.login("second@test.local", "another-long-pass")).status, 200);
    assert.equal((await admin.post("/api/admin/admins", { email: "second@test.local", name: "x", password: "another-long-pass" })).status, 409);
    assert.equal((await admin.post("/api/admin/admins", { email: "bad", name: "x", password: "short" })).status, 422);
    const list = await admin.get("/api/admin/admins");
    assert.deepEqual(list.body.items.map((a) => a.email).sort(), [ADMIN.email, "second@test.local"].sort());
  });

  it("deactivating signs that admin out and blocks login; can't disable or delete yourself", async () => {
    const created = (await admin.post("/api/admin/admins", { email: "third@test.local", name: "Third", password: "third-long-pass1" })).body;
    const c = new Client(server.base);
    await c.login("third@test.local", "third-long-pass1");
    assert.equal((await c.get("/api/admin/auth/me")).status, 200);
    assert.equal((await admin.patch(`/api/admin/admins/${created.id}`, { active: false })).status, 200);
    assert.equal((await c.get("/api/admin/auth/me")).status, 401);
    assert.equal((await new Client(server.base).login("third@test.local", "third-long-pass1")).status, 401);

    const me = (await admin.get("/api/admin/auth/me")).body.admin;
    assert.equal((await admin.patch(`/api/admin/admins/${me.id}`, { active: false })).status, 409);
    assert.equal((await admin.del(`/api/admin/admins/${me.id}`)).status, 409);
  });

  it("resetting a password kills that admin's sessions; deleting removes the account", async () => {
    const u = (await admin.post("/api/admin/admins", { email: "fourth@test.local", name: "Fourth", password: "fourth-long-pass" })).body;
    const c = new Client(server.base);
    await c.login("fourth@test.local", "fourth-long-pass");
    assert.equal((await admin.patch(`/api/admin/admins/${u.id}`, { password: "brand-new-long-pass" })).status, 200);
    assert.equal((await c.get("/api/admin/auth/me")).status, 401);
    assert.equal((await new Client(server.base).login("fourth@test.local", "brand-new-long-pass")).status, 200);
    assert.equal((await admin.del(`/api/admin/admins/${u.id}`)).status, 204);
    assert.equal((await admin.del(`/api/admin/admins/${u.id}`)).status, 404);
    assert.equal((await new Client(server.base).login("fourth@test.local", "brand-new-long-pass")).status, 401);
  });

  it("never lets the last active admin be removed", async () => {
    // Only ADMIN + any still-active others: deactivate all others first, then try the other direction.
    const list = (await admin.get("/api/admin/admins")).body.items;
    const me = (await admin.get("/api/admin/auth/me")).body.admin;
    for (const a of list.filter((x) => x.id !== me.id && x.active)) await admin.patch(`/api/admin/admins/${a.id}`, { active: false });
    const other = (await admin.post("/api/admin/admins", { email: "last@test.local", name: "L", password: "last-long-pass12" })).body;
    const c = new Client(server.base);
    await c.login("last@test.local", "last-long-pass12");
    await admin.patch(`/api/admin/admins/${me.id}`, { active: false }).then(() => {});
    // `admin` was just deactivated by itself? not allowed (409) — so use the other admin to try disabling `admin`.
    assert.equal((await c.patch(`/api/admin/admins/${me.id}`, { active: false })).status, 200);
    // now `last` is the only active admin
    assert.equal((await c.patch(`/api/admin/admins/${other.id}`, { active: false })).status, 409);
    assert.equal((await c.del(`/api/admin/admins/${other.id}`)).status, 409);
  });
});

describe("banner image upload", () => {
  let server, admin, anon;
  before(async () => {
    server = await startTestServer({ env: { MAX_UPLOAD_MB: "0.1" } });
    admin = await signedInClient(server);
    anon = new Client(server.base);
  });
  after(() => server.close());

  const send = (client, buf, name = "b.png") => {
    const form = new FormData();
    form.append("image", new Blob([buf], { type: "image/png" }), name);
    return client.request("POST", "/api/admin/banners/image", { form });
  };

  it("stores the picture, serves it publicly, and it works as a banner image", async () => {
    const buf = png(300);
    const r = await send(admin, buf);
    assert.equal(r.status, 201);
    assert.match(r.body.url, /\/images\/b\/\d+$/);
    const got = await fetch(r.body.url);
    assert.equal(got.status, 200);
    assert.equal(got.headers.get("content-type"), "image/png");
    assert.ok(Buffer.from(await got.arrayBuffer()).equals(buf));
    const banner = await admin.post("/api/admin/banners", { headline: "Sale", image: r.body.url });
    assert.equal(banner.status, 201);
    assert.equal((await anon.get("/api/banners")).body.items[0].image, r.body.url);
  });

  it("rejects non-images, oversize files, missing files and anonymous callers", async () => {
    assert.equal((await send(admin, Buffer.from("just some text, not an image at all"))).status, 415);
    assert.equal((await send(admin, png(200_000))).status, 413);
    assert.equal((await admin.request("POST", "/api/admin/banners/image", { form: new FormData() })).status, 422);
    assert.equal((await send(anon, png(100))).status, 401);
    assert.equal((await fetch(`${server.base}/images/b/99999`)).status, 404);
    assert.equal((await fetch(`${server.base}/images/b/abc`)).status, 404);
  });
});

describe("new-order email alert", () => {
  let server, admin, anon;
  const sent = [];
  let fail = false;
  const transport = {
    sendMail: async (m) => {
      if (fail) throw new Error("smtp down");
      sent.push(m);
    },
  };

  before(async () => {
    server = await startTestServer({ options: { mailTransport: transport }, env: { NOTIFY_EMAIL_TO: "owner@shop.test, staff@shop.test", STORE_NAME: "TestShop" } });
    admin = await signedInClient(server);
    anon = new Client(server.base);
    await makeCategory(admin, "cameras", { name: "Cameras" });
  });
  after(() => server.close());

  const order = (sku, extra = {}) => ({
    customer: { name: "Jane <b>Doe</b>", phone: "0712345678", address: "Somewhere 1" },
    items: [{ sku, quantity: 1 }],
    deliveryMethod: "courier",
    deliveryFee: 500,
    paymentMethod: "mpesa",
    ...extra,
  });
  const settle = () => new Promise((r) => setTimeout(r, 100));

  it("emails the owner the server-priced order, without blocking checkout", async () => {
    const p = await makeProduct(admin, { name: "Alert Cam", price: 10000 });
    const r = await anon.post("/api/orders", order(p.sku, { notes: "call first" }));
    assert.equal(r.status, 201);
    await settle();
    assert.equal(sent.length, 1);
    const m = sent[0];
    assert.equal(m.to, "owner@shop.test, staff@shop.test");
    assert.match(m.subject, new RegExp(`New order ${r.body.ref}`));
    assert.match(m.text, /Alert Cam ×1/);
    assert.match(m.text, /KES 10,500/);
    assert.match(m.text, /call first/);
    assert.ok(!m.html.includes("<b>Doe</b>"), "customer text is HTML-escaped");
  });

  it("a failing mail server never breaks checkout", async () => {
    const p = await makeProduct(admin, { name: "Alert Cam 2", price: 5000 });
    fail = true;
    const before = sent.length;
    const r = await anon.post("/api/orders", order(p.sku));
    fail = false;
    assert.equal(r.status, 201);
    await settle();
    assert.equal(sent.length, before);
  });

  it("rejected orders send nothing", async () => {
    const before = sent.length;
    assert.equal((await anon.post("/api/orders", order("NOPE-1"))).status, 409);
    await settle();
    assert.equal(sent.length, before);
  });
});
