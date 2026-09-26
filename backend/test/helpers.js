import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import mysql from "mysql2/promise";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db.js";
import { runMigrations } from "../src/migrate.js";
import { hashPassword } from "../src/services/auth.js";

export const ADMIN = { email: "admin@test.local", password: "correct-horse-battery", name: "Tester" };

// --- tiny fake images (only the magic bytes matter to the server) -----------
const pad = (head, n = 64) => Buffer.concat([head, Buffer.alloc(n, 7)]);
export const jpeg = (n) => pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), n);
export const png = (n) => pad(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), n);
export const webp = (n) => pad(Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP")]), n);
export const fakeJpgActuallyText = () => Buffer.from("this is definitely not an image, just text pretending");
export const gif = () => pad(Buffer.from("GIF89a"), 32);

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

/**
 * Boots the app against the throwaway test database (schema reset each time)
 * and a temp image folder. Refuses to touch any database not named *_test.
 */
export async function startTestServer({ options = {}, env = {}, folders = ["01_cameras", "02_tvs"] } = {}) {
  const dbName = process.env.TEST_DB_NAME ?? "ph_test";
  if (!dbName.endsWith("_test")) throw new Error(`Refusing to run tests against "${dbName}" (must end in _test)`);

  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ph-images-"));
  for (const f of folders) await fs.mkdir(path.join(root, f));

  const port = await freePort();
  const config = loadConfig({
    NODE_ENV: "test",
    DB_HOST: process.env.TEST_DB_HOST ?? "127.0.0.1",
    DB_PORT: process.env.TEST_DB_PORT ?? "3307",
    DB_USER: process.env.TEST_DB_USER ?? "ph_test",
    DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? "testpass",
    DB_NAME: dbName,
    IMAGES_ROOT: root,
    PUBLIC_URL: `http://127.0.0.1:${port}`,
    CORS_ORIGINS: "http://localhost:3000",
    ...env,
  });

  // Reset schema (multipleStatements only here, never in the app's pool).
  const admin = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true,
  });
  await admin.query(
    "SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS banner_images, product_images, order_items, orders, reviews, banners, admin_sessions, admins, products, categories, schema_migrations; SET FOREIGN_KEY_CHECKS=1;"
  );
  await runMigrations(admin);
  await admin.end();

  const pool = createPool(config.db);
  await pool.query("INSERT INTO admins (email, name, password_hash) VALUES (?, ?, ?)", [
    ADMIN.email,
    ADMIN.name,
    await hashPassword(ADMIN.password),
  ]);

  const app = createApp({ config, pool, options });
  const server = await new Promise((resolve) => {
    const s = app.listen(port, "127.0.0.1", () => resolve(s));
  });

  return {
    base: `http://127.0.0.1:${port}`,
    config,
    pool,
    root,
    async close() {
      server.closeAllConnections?.();
      await new Promise((r) => server.close(r));
      await pool.end();
      await fs.rm(root, { recursive: true, force: true });
    },
  };
}

/** Minimal cookie-jar HTTP client. */
export class Client {
  constructor(base) {
    this.base = base;
    this.cookie = null;
  }

  async request(method, url, { json, form, headers = {}, raw } = {}) {
    const h = { ...headers };
    let body;
    if (json !== undefined) {
      h["content-type"] = "application/json";
      body = JSON.stringify(json);
    } else if (form) body = form;
    else if (raw !== undefined) body = raw;
    if (this.cookie) h.cookie = this.cookie;

    const res = await fetch(this.base + url, { method, headers: h, body, redirect: "manual" });
    for (const sc of res.headers.getSetCookie?.() ?? []) {
      const [pair] = sc.split(";");
      const [name, value] = pair.split("=");
      if (/max-age=0/i.test(sc) || value === "") this.cookie = null;
      else this.cookie = `${name}=${value}`;
    }
    const text = await res.text();
    let parsed = text;
    if ((res.headers.get("content-type") ?? "").includes("json")) parsed = text ? JSON.parse(text) : null;
    return { status: res.status, body: parsed, headers: res.headers, text };
  }

  get = (url, o) => this.request("GET", url, o);
  post = (url, json, o = {}) => this.request("POST", url, { json, ...o });
  patch = (url, json, o = {}) => this.request("PATCH", url, { json, ...o });
  put = (url, json, o = {}) => this.request("PUT", url, { json, ...o });
  del = (url, o) => this.request("DELETE", url, o);

  login(email = ADMIN.email, password = ADMIN.password) {
    return this.post("/api/admin/auth/login", { email, password });
  }

  /** multipart upload: files = [{ buffer, name }], fields = { folder: "..." } */
  upload(url, files, fields = {}) {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    for (const f of files) form.append("images", new Blob([f.buffer], { type: "image/jpeg" }), f.name ?? "x.jpg");
    return this.request("POST", url, { form });
  }
}

export async function signedInClient(server) {
  const c = new Client(server.base);
  const r = await c.login();
  if (r.status !== 200) throw new Error(`test login failed: ${JSON.stringify(r.body)}`);
  return c;
}

export async function makeCategory(client, slug, extra = {}) {
  const r = await client.post("/api/admin/categories", { slug, name: slug.toUpperCase(), ...extra });
  if (r.status !== 201) throw new Error(`makeCategory failed: ${JSON.stringify(r.body)}`);
  return r.body;
}

export async function makeProduct(client, overrides = {}) {
  const n = Math.random().toString(36).slice(2, 8);
  const r = await client.post("/api/admin/products", {
    name: `Product ${n}`,
    sku: `SKU-${n}`,
    category: "cameras",
    price: 1000,
    ...overrides,
  });
  if (r.status !== 201) throw new Error(`makeProduct failed: ${JSON.stringify(r.body)}`);
  return r.body;
}
