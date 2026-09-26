import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { ADMIN, Client, startTestServer } from "./helpers.js";

describe("admin authentication", () => {
  let server;
  before(async () => {
    server = await startTestServer({ options: { loginAttempts: 1000 } });
  });
  after(() => server.close());

  const fresh = () => new Client(server.base);

  it("rejects protected routes without a session (401)", async () => {
    for (const [method, url] of [
      ["GET", "/api/admin/products"],
      ["POST", "/api/admin/products"],
      ["GET", "/api/admin/categories"],
      ["GET", "/api/admin/image-folders"],
      ["DELETE", "/api/admin/products/1"],
    ]) {
      const r = await fresh().request(method, url, method === "POST" ? { json: {} } : {});
      assert.equal(r.status, 401, `${method} ${url}`);
      assert.equal(r.body.error.code, "UNAUTHENTICATED");
    }
  });

  it("gives the same error for a wrong password and an unknown email", async () => {
    const wrongPw = await fresh().login(ADMIN.email, "definitely-wrong");
    const noUser = await fresh().login("nobody@test.local", "definitely-wrong");
    assert.equal(wrongPw.status, 401);
    assert.equal(noUser.status, 401);
    assert.deepEqual(wrongPw.body, noUser.body);
    assert.equal(wrongPw.body.error.code, "INVALID_CREDENTIALS");
  });

  it("logs in: HttpOnly cookie scoped to /api/admin, no secrets in the body", async () => {
    const c = fresh();
    const r = await c.login();
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.body), ["admin"]);
    assert.equal(r.body.admin.email, ADMIN.email);
    assert.ok(!JSON.stringify(r.body).includes("password"));

    const setCookie = r.headers.getSetCookie()[0];
    assert.match(setCookie, /^ph_admin_session=/);
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    assert.match(setCookie, /Path=\/api\/admin/);

    const me = await c.get("/api/admin/auth/me");
    assert.equal(me.status, 200);
    assert.equal(me.body.admin.email, ADMIN.email);
  });

  it("stores only a hash of the session token", async () => {
    const c = fresh();
    await c.login();
    const token = c.cookie.split("=")[1];
    const [rows] = await server.pool.query("SELECT token_hash FROM admin_sessions");
    assert.ok(rows.length > 0);
    assert.ok(rows.every((r) => r.token_hash !== token && r.token_hash.length === 64));
  });

  it("logout really revokes the session (replaying the old cookie fails)", async () => {
    const c = fresh();
    await c.login();
    const stolen = c.cookie;
    assert.equal((await c.post("/api/admin/auth/logout")).status, 204);
    assert.equal((await c.get("/api/admin/auth/me")).status, 401);

    const attacker = fresh();
    attacker.cookie = stolen; // an attacker replaying the pre-logout cookie
    assert.equal((await attacker.get("/api/admin/auth/me")).status, 401);
  });

  it("logout is idempotent", async () => {
    const r = await fresh().post("/api/admin/auth/logout");
    assert.equal(r.status, 204);
  });

  it("validates the login body (422)", async () => {
    const r = await fresh().post("/api/admin/auth/login", { email: "not-an-email", password: "x" });
    assert.equal(r.status, 422);
    assert.equal(r.body.error.code, "VALIDATION_ERROR");
    assert.equal(r.body.error.details[0].path, "email");
    assert.equal((await fresh().post("/api/admin/auth/login", {})).status, 422);
  });

  it("rejects malformed JSON with 400, not a 500", async () => {
    const r = await fresh().request("POST", "/api/admin/auth/login", {
      raw: "{not json",
      headers: { "content-type": "application/json" },
    });
    assert.equal(r.status, 400);
    assert.equal(r.body.error.code, "BAD_REQUEST");
  });

  it("rejects expired sessions", async () => {
    const c = fresh();
    await c.login();
    await server.pool.query("UPDATE admin_sessions SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 MINUTE");
    const r = await c.get("/api/admin/auth/me");
    assert.equal(r.status, 401);
  });

  it("rejects sessions of deactivated admins, and blocks their login", async () => {
    const c = fresh();
    await c.login();
    await server.pool.query("UPDATE admins SET active = 0");
    assert.equal((await c.get("/api/admin/auth/me")).status, 401);
    assert.equal((await fresh().login()).status, 401);
    await server.pool.query("UPDATE admins SET active = 1");
  });

  it("blocks cross-site state-changing requests (Origin guard)", async () => {
    const c = fresh();
    await c.login();
    // Forged Origin from a hostile site, with the victim's valid cookie:
    const evil = await c.post("/api/admin/categories", { slug: "csrf", name: "CSRF" }, { headers: { origin: "https://evil.example" } });
    assert.equal(evil.status, 403);
    // ...and nothing was created.
    const [rows] = await server.pool.query("SELECT id FROM categories WHERE slug = 'csrf'");
    assert.equal(rows.length, 0);
    // A configured frontend origin is fine.
    const ok = await c.post("/api/admin/categories", { slug: "legit", name: "Legit" }, { headers: { origin: "http://localhost:3000" } });
    assert.equal(ok.status, 201);
  });

  it("sends CORS headers only to allowed origins", async () => {
    const good = await fetch(`${server.base}/api/categories`, { headers: { origin: "http://localhost:3000" } });
    assert.equal(good.headers.get("access-control-allow-origin"), "http://localhost:3000");
    assert.equal(good.headers.get("access-control-allow-credentials"), "true");
    const bad = await fetch(`${server.base}/api/categories`, { headers: { origin: "https://evil.example" } });
    assert.equal(bad.headers.get("access-control-allow-origin"), null);
  });

  describe("change password", () => {
    it("validates, requires the current password, and revokes other sessions", async () => {
      const a = fresh();
      const b = fresh();
      await a.login();
      await b.login();

      assert.equal((await a.post("/api/admin/auth/change-password", { currentPassword: "wrong", newPassword: "another-long-password" })).status, 401);
      assert.equal((await a.post("/api/admin/auth/change-password", { currentPassword: ADMIN.password, newPassword: "short" })).status, 422);
      assert.equal((await a.post("/api/admin/auth/change-password", { currentPassword: ADMIN.password, newPassword: ADMIN.password })).status, 422);

      const ok = await a.post("/api/admin/auth/change-password", { currentPassword: ADMIN.password, newPassword: "a-brand-new-password" });
      assert.equal(ok.status, 204);

      assert.equal((await a.get("/api/admin/auth/me")).status, 200, "current session survives");
      assert.equal((await b.get("/api/admin/auth/me")).status, 401, "other sessions are signed out");
      assert.equal((await fresh().login(ADMIN.email, ADMIN.password)).status, 401, "old password no longer works");
      assert.equal((await fresh().login(ADMIN.email, "a-brand-new-password")).status, 200);

      await a.post("/api/admin/auth/change-password", { currentPassword: "a-brand-new-password", newPassword: ADMIN.password });
    });
  });
});

describe("login rate limiting", () => {
  let server;
  before(async () => {
    server = await startTestServer({ options: { loginAttempts: 3 } });
  });
  after(() => server.close());

  it("locks out repeated failures with 429 — successful logins don't count", async () => {
    const c = new Client(server.base);
    for (let i = 0; i < 2; i++) assert.equal((await c.login()).status, 200); // successes are free
    for (let i = 0; i < 3; i++) assert.equal((await c.login(ADMIN.email, "wrong")).status, 401);
    const blocked = await c.login(ADMIN.email, "wrong");
    assert.equal(blocked.status, 429);
    assert.equal(blocked.body.error.code, "RATE_LIMITED");
    // even the right password is refused while locked out
    assert.equal((await c.login()).status, 429);
  });
});
