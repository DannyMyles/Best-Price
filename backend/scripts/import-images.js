// Loads product photos from the pricehub image library into MariaDB.
//
// For every product whose `image_dir` ("<NN_category>/<Item Name>", set by
// import-catalog) points at an existing folder, the images in that folder are
// stored in `product_images` in their numeric order ("- 1" first = primary).
//
// Products that already have photos in the database are skipped, so re-running
// is safe and never touches photos edited in the admin. Use --replace to wipe
// and reload a product's photos from disk, and --dry-run to preview.
//
//   npm run import-images -- --dry-run
//   npm run import-images
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db.js";
import { detectImageType, IMAGE_EXTS, MAX_IMAGES_PER_PRODUCT } from "../src/lib/images.js";

const { values: args } = parseArgs({
  options: { "dry-run": { type: "boolean", default: false }, replace: { type: "boolean", default: false } },
});

const config = loadConfig(process.env);
const pool = createPool(config.db);
const NUMBER_RE = / - (\d+)\.(?:jpe?g|png|webp)$/i;
const num = (f) => (NUMBER_RE.exec(f) ? Number(NUMBER_RE.exec(f)[1]) : Number.POSITIVE_INFINITY);

let products = 0, stored = 0, skipped = 0, missing = 0, bytes = 0, bad = 0;

try {
  const [rows] = await pool.query("SELECT id, name, image_dir FROM products WHERE image_dir IS NOT NULL ORDER BY id");
  for (const p of rows) {
    const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM product_images WHERE product_id = ?", [p.id]);
    if (n > 0 && !args.replace) {
      skipped++;
      continue;
    }
    const dir = path.join(config.imagesRoot, ...p.image_dir.split("/"));
    let names;
    try {
      names = (await fs.readdir(dir)).filter((f) => !f.startsWith(".") && IMAGE_EXTS.includes(path.extname(f).toLowerCase()));
    } catch {
      missing++;
      console.warn(`  no folder for "${p.name}" (${p.image_dir})`);
      continue;
    }
    names.sort((a, b) => num(a) - num(b) || a.localeCompare(b, "en", { numeric: true }));

    const files = [];
    for (const name of names.slice(0, MAX_IMAGES_PER_PRODUCT)) {
      const buffer = await fs.readFile(path.join(dir, name));
      const type = detectImageType(buffer);
      if (!type) {
        bad++;
        console.warn(`  skipping ${p.image_dir}/${name}: not a JPEG/PNG/WebP`);
        continue;
      }
      files.push({ name, buffer, mime: type.mime });
    }
    if (!files.length) continue;

    products++;
    stored += files.length;
    bytes += files.reduce((s, f) => s + f.buffer.length, 0);
    if (args["dry-run"]) continue;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("DELETE FROM product_images WHERE product_id = ?", [p.id]);
      for (const [i, f] of files.entries()) {
        await conn.query(
          "INSERT INTO product_images (product_id, position, file_name, mime, size, data) VALUES (?, ?, ?, ?, ?, ?)",
          [p.id, i + 1, f.name, f.mime, f.buffer.length, f.buffer]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
  const mb = (bytes / 1024 / 1024).toFixed(1);
  console.log(
    `${args["dry-run"] ? "[dry run] would store" : "Stored"} ${stored} images (${mb} MB) for ${products} products; ` +
      `${skipped} already had photos, ${missing} folders missing, ${bad} files rejected.`
  );
} finally {
  await pool.end();
}
