/**
 * Imports the ~/Desktop/programming/pricehub image library into Firestore +
 * Storage: uploads every product's images (primary + QC'd extra angles)
 * under products/<slug>/<angle>.<ext>, and creates/updates the matching
 * product doc with real pricing from PRODUCT_MAPPING.csv.
 *
 * Reads (from the pricehub project, not this repo):
 *   MANIFEST.csv        — category, raw_name, target_filename (primary image)
 *   ANGLES.csv           — extra angle images, keyed to a MANIFEST row
 *   PRODUCT_MAPPING.csv  — category/slug/sku/price + duplicate-of-existing flag
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/import-pricehub-catalog.ts
 *     -> DRY RUN (default). Prints the full plan, touches nothing.
 *   npx tsx --env-file=.env.local scripts/import-pricehub-catalog.ts --commit
 *     -> Real run: uploads images to Storage, writes Firestore docs.
 *   ... --commit --limit 3        # only the first 3 products (smoke test)
 *   ... --commit --sku CAN-R50V-BODY   # a single product by suggested SKU
 *
 * Needs service-account.json (Admin SDK) and Storage enabled (Blaze plan) —
 * without Storage this fails on the first upload in --commit mode; dry runs
 * work regardless.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { randomUUID } from "crypto";

const PRICEHUB = "/home/danny/Desktop/programming/pricehub";
const MANIFEST_PATH = path.join(PRICEHUB, "MANIFEST.csv");
const ANGLES_PATH = path.join(PRICEHUB, "ANGLES.csv");
const MAPPING_PATH = path.join(PRICEHUB, "PRODUCT_MAPPING.csv");

// ---- args -----------------------------------------------------------
const argv = process.argv.slice(2);
const COMMIT = argv.includes("--commit");
const limitArg = argv.indexOf("--limit");
const LIMIT = limitArg !== -1 ? Number(argv[limitArg + 1]) : undefined;
const skuArg = argv.indexOf("--sku");
const ONLY_SKU = skuArg !== -1 ? argv[skuArg + 1] : undefined;

// ---- tiny RFC4180-ish CSV parser (mirrors src/lib/csv.ts) -----------
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const nonEmpty = rows.filter((r) => r.some((v) => v.trim() !== ""));
  if (nonEmpty.length < 2) return [];
  const headers = nonEmpty[0].map((h) => h.trim());
  return nonEmpty.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (r[idx] ?? "").trim()));
    return obj;
  });
}

function loadCsv(p: string): Record<string, string>[] {
  return parseCsv(readFileSync(p, "utf-8"));
}

// ---- Firebase Admin ---------------------------------------------------
function loadServiceAccount(): Record<string, unknown> {
  const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "./service-account.json";
  return JSON.parse(readFileSync(p, "utf-8"));
}

const svc = loadServiceAccount();
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const app = initializeApp({ credential: cert(svc as never), storageBucket });
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function uploadImage(localPath: string, destPath: string): Promise<string> {
  const ext = path.extname(localPath).toLowerCase();
  const token = randomUUID();
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: {
      contentType: CONTENT_TYPE[ext] ?? "image/jpeg",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  const encoded = encodeURIComponent(destPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`;
}

// ---- build the per-product plan ---------------------------------------
interface ImageStep {
  angle: string;
  localPath: string;
}
interface Plan {
  targetFilename: string;
  raw_name: string;
  normalized_name: string;
  brand: string;
  category: string;
  suggestedSlug: string;
  suggestedSku: string;
  priceKes: number;
  status: "NEW" | "MATCH-EXISTING";
  duplicateOfSku: string;
  needsReview: string;
  images: ImageStep[];
}

function primaryImagePath(pricehubCategory: string, targetFilename: string): string | null {
  const direct = path.join(PRICEHUB, pricehubCategory, targetFilename);
  if (existsSync(direct)) return direct;
  const stem = path.join(PRICEHUB, pricehubCategory, path.parse(targetFilename).name);
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    if (existsSync(stem + ext)) return stem + ext;
  }
  return null;
}

async function buildPlans(): Promise<Plan[]> {
  const manifest = loadCsv(MANIFEST_PATH);
  const angles = loadCsv(ANGLES_PATH);
  const mapping = loadCsv(MAPPING_PATH);

  const manifestByFile = new Map(manifest.map((r) => [r.target_filename, r]));
  const anglesByBase = new Map<string, Record<string, string>[]>();
  for (const a of angles) {
    const arr = anglesByBase.get(a.base_target_filename) ?? [];
    arr.push(a);
    anglesByBase.set(a.base_target_filename, arr);
  }

  const plans: Plan[] = [];
  for (const m of mapping) {
    const man = manifestByFile.get(m.target_filename);
    if (!man) {
      console.warn(`WARN no MANIFEST row for ${m.target_filename}`);
      continue;
    }
    const primary = primaryImagePath(m.pricehub_category, m.target_filename);
    if (!primary) {
      console.warn(`WARN missing primary image on disk: ${m.target_filename}`);
      continue;
    }
    const images: ImageStep[] = [{ angle: "main", localPath: primary }];
    for (const a of anglesByBase.get(m.target_filename) ?? []) {
      if (existsSync(a.path)) images.push({ angle: a.angle, localPath: a.path });
    }
    plans.push({
      targetFilename: m.target_filename,
      raw_name: m.raw_name,
      normalized_name: m.normalized_name,
      brand: m.brand,
      category: m.pricehub_mapped_category,
      suggestedSlug: m.suggested_slug,
      suggestedSku: m.suggested_sku,
      priceKes: Number(m.price_kes),
      status: m.status as "NEW" | "MATCH-EXISTING",
      duplicateOfSku: m.duplicate_of_existing_sku,
      needsReview: m.needs_review,
      images,
    });
  }
  return plans;
}

function describe(p: Plan): string {
  return `${p.brand} ${p.normalized_name}. Genuine stock — message us on WhatsApp for full specifications, warranty and current availability.`;
}

// ---- main ---------------------------------------------------------
async function main() {
  let plans = await buildPlans();
  if (ONLY_SKU) plans = plans.filter((p) => p.suggestedSku === ONLY_SKU);
  if (LIMIT) plans = plans.slice(0, LIMIT);

  console.log(
    `${COMMIT ? "COMMIT" : "DRY RUN"} — ${plans.length} product(s), ` +
      `${plans.reduce((s, p) => s + p.images.length, 0)} image file(s) total\n`
  );

  let created = 0,
    updated = 0,
    imagesUploaded = 0,
    errors = 0;

  for (const p of plans) {
    const flag = p.needsReview ? "  [flagged: " + p.needsReview + "]" : "";
    try {
      let slug = p.suggestedSlug;
      let existingId: string | null = null;

      if (p.status === "MATCH-EXISTING") {
        const snap = await db
          .collection("products")
          .where("sku", "==", p.duplicateOfSku)
          .limit(1)
          .get();
        if (snap.empty) {
          console.warn(
            `  WARN ${p.raw_name}: expected existing product ${p.duplicateOfSku}, not found — treating as NEW`
          );
        } else {
          existingId = snap.docs[0].id;
          slug = existingId;
        }
      }

      console.log(
        `${p.status === "MATCH-EXISTING" && existingId ? "MATCH" : "NEW  "} ` +
          `${p.raw_name.padEnd(28)} -> ${slug}  KES ${p.priceKes}  (${p.images.length} imgs)${flag}`
      );

      const imageUrls: string[] = [];
      for (const img of p.images) {
        const ext = path.extname(img.localPath).toLowerCase() || ".jpg";
        const dest = `products/${slug}/${img.angle}${ext}`;
        if (COMMIT) {
          const url = await uploadImage(img.localPath, dest);
          imageUrls.push(url);
          imagesUploaded++;
        } else {
          imageUrls.push(`(dry-run) gs://${storageBucket}/${dest}`);
        }
      }

      if (existingId) {
        if (COMMIT) {
          await db.collection("products").doc(existingId).update({
            images: imageUrls,
            price: p.priceKes,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        updated++;
      } else {
        const doc = {
          sku: p.suggestedSku,
          name: p.normalized_name,
          category: p.category,
          price: p.priceKes,
          compareAtPrice: null,
          description: describe(p),
          specs: [],
          images: imageUrls,
          inStock: true,
          stockCount: null,
          rating: null,
          reviewCount: null,
          featured: false,
          active: true,
          featureRank: null,
          badge: null,
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (COMMIT) {
          const ref = db.collection("products").doc(slug);
          const exists = (await ref.get()).exists;
          await ref.set(
            { ...doc, ...(exists ? {} : { createdAt: FieldValue.serverTimestamp() }) },
            { merge: true }
          );
        }
        created++;
      }
    } catch (err) {
      errors++;
      console.error(`  ERROR ${p.raw_name}:`, (err as Error).message);
    }
  }

  console.log(
    `\n${COMMIT ? "Committed" : "Would commit"}: ${created} new, ${updated} updated, ` +
      `${COMMIT ? imagesUploaded : plans.reduce((s, p) => s + p.images.length, 0)} images, ${errors} errors`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
