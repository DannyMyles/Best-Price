// Writes real descriptions + specs (data/product-details.js) onto imported products.
//
// Safe by default: a product's description is replaced only while it is still the generic
// import text, and specs are added only while it has none — so anything you've edited in the
// admin is left alone. `--force` overwrites both. `--dry-run` previews.
//
//   npm run enrich-products -- --dry-run
//   npm run enrich-products
import { parseArgs } from "node:util";
import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db.js";
import { NAME_FIXES, PRODUCT_DETAILS } from "../data/product-details.js";

const { values: args } = parseArgs({ options: { "dry-run": { type: "boolean", default: false }, force: { type: "boolean", default: false } } });
const pool = createPool(loadConfig(process.env).db);
const GENERIC = /Genuine stock — message us on WhatsApp for full specifications/;

let described = 0, specced = 0, renamed = 0, skipped = 0;
const seen = new Set();
try {
  const [rows] = await pool.query("SELECT id, sku, name, description, specs FROM products");
  for (const p of rows) {
    const detail = PRODUCT_DETAILS[p.sku];
    seen.add(p.sku);
    if (!detail) continue;
    const sets = [], params = [];
    if (args.force || GENERIC.test(p.description ?? "") || !p.description) {
      sets.push("description = ?"); params.push(detail.description); described++;
    } else skipped++;
    const current = typeof p.specs === "string" ? JSON.parse(p.specs || "[]") : (p.specs ?? []);
    if (args.force || current.length === 0) {
      sets.push("specs = ?"); params.push(JSON.stringify(detail.specs)); specced++;
    }
    if (NAME_FIXES[p.sku] && p.name !== NAME_FIXES[p.sku]) {
      sets.push("name = ?"); params.push(NAME_FIXES[p.sku]); renamed++;
    }
    if (sets.length && !args["dry-run"]) await pool.query(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`, [...params, p.id]);
  }
  const missing = Object.keys(PRODUCT_DETAILS).filter((s) => !seen.has(s));
  const uncovered = rows.filter((p) => !PRODUCT_DETAILS[p.sku]).map((p) => p.sku);
  console.log(`${args["dry-run"] ? "[dry run] would update" : "Updated"}: ${described} descriptions, ${specced} spec lists, ${renamed} names; ${skipped} edited descriptions kept.`);
  if (missing.length) console.log(`SKUs in the data file but not in the database: ${missing.join(", ")}`);
  if (uncovered.length) console.log(`Products with no entry in the data file: ${uncovered.join(", ")}`);
} finally {
  await pool.end();
}
