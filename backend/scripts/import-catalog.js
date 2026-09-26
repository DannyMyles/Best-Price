// Seeds MariaDB from the pricehub library:
//   - categories from data/categories.json (the storefront's 9 departments)
//   - products from <IMAGES_ROOT>/MANIFEST.csv + data/prices.csv (your price list)
//
// Create-only by default: products whose SKU/slug already exist are skipped, so
// re-running never overwrites edits made in the admin. Pass --update to refresh
// name/brand/price/category from the files.  Use --dry-run to preview.
//
//   npm run import-catalog -- --dry-run
//   npm run import-catalog
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db.js";
import { safeName, slugify } from "../src/lib/slug.js";

const { values: args } = parseArgs({
  options: { "dry-run": { type: "boolean", default: false }, update: { type: "boolean", default: false } },
});
const DRY = args["dry-run"];
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");

// --- tiny RFC-4180 CSV reader ---------------------------------------------
function parseCsv(text) {
  const rows = [];
  let field = "", row = [], inQ = false;
  const src = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQ) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); field = ""; row = []; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((v) => v.trim()));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

// --- category mapping (pricehub folder -> storefront category slug) -------
const FOLDER_CATEGORY = {
  "01_canon-cameras": "cameras", "02_canon-camcorders-cinema": "cameras", "08_sony-cameras": "cameras", "10_nikon": "cameras",
  "03_canon-lenses": "lenses", "04_lenses-other-or-duplicate": "lenses", "09_sony-lenses": "lenses",
  "06_gopro": "accessories", "13_memory-cards": "accessories",
  "11_wireless-mics": "audio", "12_mics-other-maono-fifine": "audio",
  "14_tv-hisense": "tvs", "15_tv-sony": "tvs", "16_tv-samsung": "tvs", "17_tv-tcl": "tvs",
  "18_soundbars-brand-TBD": "audio", "19_jbl": "audio", "20_portable-speakers-brand-TBD": "audio",
};
function categoryFor(row) {
  const n = row.normalized_name.toLowerCase();
  if (row.category === "05_dji-gimbals-action") return /mobile/.test(n) ? "accessories" : "cameras"; // phone gimbals vs. real cameras
  if (row.category === "07_insta360") return /battery|stick/.test(n) ? "accessories" : "cameras";
  if (row.category === "21_headphones-audio-misc") return /playstation|fc 25|dualsense/.test(n) ? "accessories" : "audio";
  return FOLDER_CATEGORY[row.category] ?? "accessories";
}

// --- corrections found while researching the list ------------------------
// Model codes like "43S20M2 / 55-S30" are Sony BRAVIA 2 II (S20) / BRAVIA 3 (S30),
// not Hisense (confirmed against Sony's line-up and retailer listings).
const BRAVIA = {
  "43S20M2": 'Sony BRAVIA 2 II 43" (K-43S20M2)', "50S20m2": 'Sony BRAVIA 2 II 50" (K-50S20M2)',
  "55-S20": 'Sony BRAVIA 2 II 55" (K-55S20M2)', "65S20M2": 'Sony BRAVIA 2 II 65" (K-65S20M2)',
  "55-S30": 'Sony BRAVIA 3 55" (K-55S30)', "65-S30M3": 'Sony BRAVIA 3 65" (K-65S30M3)', "85-S30": 'Sony BRAVIA 3 85" (K-85S30)',
};
const OVERRIDES = {
  ...Object.fromEntries(Object.entries(BRAVIA).map(([raw, name]) => [raw, { name, brand: "Sony" }])),
  // memory-card brands come from the section headings of your price list
  "32 GB SD": { name: "SanDisk 32GB SD Card", brand: "SanDisk" },
  "64 GB SD": { name: "SanDisk 64GB SD Card", brand: "SanDisk" },
  "128 GB SD": { name: "SanDisk 128GB SD Card", brand: "SanDisk" },
  "64 GB": { name: "SanDisk Extreme Pro 64GB SD Card", brand: "SanDisk" },
  "128 GB": { name: "SanDisk Extreme Pro 128GB SD Card", brand: "SanDisk" },
  "64GB SD (2)": { name: "Lexar 64GB SD Card", brand: "Lexar" },
  "128GB SD (2)": { name: "Lexar 128GB SD Card", brand: "Lexar" },
  "256GB SD": { name: "Lexar 256GB SD Card", brand: "Lexar" },
  "64GB Mirco": { name: "Lexar 64GB microSD Card", brand: "Lexar" },
  "128GB Micro": { name: "Lexar 128GB microSD Card", brand: "Lexar" },
  "256GB micro": { name: "Lexar 256GB microSD Card", brand: "Lexar" },
  "Go Play 3 Black": { name: "Harman Kardon Go + Play 3 (Black)", brand: "Harman Kardon" },
  "Go Play 3 Grey": { name: "Harman Kardon Go + Play 3 (Grey)", brand: "Harman Kardon" },
  "Studio 9": { name: "Harman Kardon Onyx Studio 9", brand: "Harman Kardon" },
  "MIC T5 PA3": { name: "Maono Wave T5 (PA3) Wireless Lavalier Microphone", brand: "Maono" },
  S400: { name: "Sony HT-S400 2.1ch Soundbar", brand: "Sony" },
};

const BRAND_CODE = { canon: "CAN", sony: "SNY", dji: "DJI", nikon: "NIK", jbl: "JBL", gopro: "GPR", insta360: "INS", rode: "ROD", maono: "MAO", fifine: "FIF", hollyland: "HOL", boya: "BOY", tcl: "TCL", hisense: "HIS", samsung: "SAM", lg: "LG", ea: "EA", sandisk: "SAN", lexar: "LEX", "harman kardon": "HK" };

// Strip "(brand?)", "- confirm ..." and stray "?" left in the manifest's guesses
// (the uncertainty is kept in admin_notes via the confidence column instead).
const cleanName = (n) =>
  n
    .replace(/\s*\([^)]*(?:confirm|brand)[^)]*\)/gi, "")
    .replace(/\s+-\s+confirm.*$/i, "")
    .replace(/\?/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
const cleanBrand = (b) => (!b || /^\?|\?$/.test(b) ? null : b.replace(/\?$/, "").trim());

async function main() {
  const config = loadConfig();
  const pool = createPool(config.db);
  const stats = { categories: 0, created: 0, updated: 0, skipped: 0 };
  try {
    // categories
    const categories = JSON.parse(await fs.readFile(path.join(dataDir, "categories.json"), "utf8"));
    for (const [i, c] of categories.entries()) {
      if (!DRY) {
        await pool.query(
          `INSERT INTO categories (slug, name, short_name, description, icon, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE slug = slug`, // never clobber admin edits
          [c.slug, c.name, c.shortName, c.description, c.icon, i]
        );
      }
      stats.categories++;
    }
    const [catRows] = await pool.query("SELECT id, slug FROM categories");
    const catId = Object.fromEntries(catRows.map((r) => [r.slug, r.id]));

    // products
    const manifest = parseCsv(await fs.readFile(path.join(config.imagesRoot, "MANIFEST.csv"), "utf8"));
    const prices = Object.fromEntries(parseCsv(await fs.readFile(path.join(dataDir, "prices.csv"), "utf8")).map((r) => [r.raw_name, Number(r.price_kes)]));

    const usedSlugs = new Set(), usedSkus = new Set();
    const unique = (base, used) => {
      let v = base, n = 2;
      while (used.has(v)) v = `${base}-${n++}`;
      used.add(v);
      return v;
    };

    for (const row of manifest) {
      const o = OVERRIDES[row.raw_name] ?? {};
      const name = o.name ?? cleanName(row.normalized_name);
      const brand = o.brand ?? cleanBrand(row.brand);
      const slug = unique(slugify(name), usedSlugs);
      const sku = unique(`${BRAND_CODE[(brand ?? "").toLowerCase()] ?? "MISC"}-${slugify(row.raw_name).toUpperCase()}`.slice(0, 78), usedSkus);
      const categorySlug = categoryFor(row);
      const price = prices[row.raw_name] ?? null;
      if (price === null) console.warn(`  ! no price for "${row.raw_name}"`);
      // Same folder rule the pricehub scripts use: <category folder>/<safe raw_name>
      const imageDir = `${row.category}/${safeName(row.raw_name)}`;
      const notes = [row.confidence && row.confidence !== "high" ? `model confidence: ${row.confidence}` : null, row.notes || null]
        .filter(Boolean).join(" | ") || null;
      const description = `${brand ? brand + " " : ""}${name.replace(new RegExp(`^${brand ?? ""}\\s*`, "i"), "")}. Genuine stock — message us on WhatsApp for full specifications, warranty and current availability.`.replace(/\s+/g, " ");

      const [existing] = await pool.query("SELECT id FROM products WHERE sku = ? OR slug = ? OR image_dir = ?", [sku, slug, imageDir]);
      if (existing.length && !args.update) { stats.skipped++; continue; }
      if (DRY) { console.log(`  ${existing.length ? "update" : "create"}  ${sku.padEnd(30)} ${String(price ?? "—").padStart(7)}  ${categorySlug.padEnd(11)} ${name}`); existing.length ? stats.updated++ : stats.created++; continue; }

      if (existing.length) {
        await pool.query("UPDATE products SET name = ?, brand = ?, price = ?, category_id = ? WHERE id = ?", [name, brand, price, catId[categorySlug], existing[0].id]);
        stats.updated++;
      } else {
        await pool.query(
          `INSERT INTO products (slug, sku, name, category_id, brand, price, description, specs, image_dir, admin_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)`,
          [slug, sku, name, catId[categorySlug], brand, price, description, imageDir, notes]
        );
        stats.created++;
      }
    }
  } finally {
    await pool.end();
  }
  console.log(`\n${DRY ? "[dry run] " : ""}categories: ${stats.categories}  products created: ${stats.created}  updated: ${stats.updated}  skipped (already exist): ${stats.skipped}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
