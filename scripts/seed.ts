/**
 * One-time / repeatable seed script: pushes the bundled catalogue into
 * Firestore so the storefront has real data to read once a Firebase
 * project is wired up, and can bootstrap the first admin user.
 *
 * Setup:
 *   Add a Firebase service account key (Project settings -> Service
 *   accounts -> Generate new private key) and save it as
 *   service-account.json in the project root (already gitignored).
 *
 * Usage:
 *   npm run seed                                  # seed catalogue
 *   npm run seed -- --admin <uid>                 # + make users/<uid> an admin
 *   npm run seed -- --admin <uid> --email a@b.com # + store the email
 *   npm run seed -- --admin <uid> --skip-catalogue   # only bootstrap admin
 *
 * The <uid> is the Firebase Authentication user's UID (Authentication ->
 * Users -> copy UID). The security rules can't create the first admin
 * because writing users/{uid} itself requires being an admin — so this
 * script (Admin SDK, bypasses rules) is the bootstrap path.
 */
import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { products } from "../src/lib/data/products";
import { categories } from "../src/lib/data/categories";
import { categoryImages } from "../src/lib/data/categoryImages";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

const adminUid = arg("admin");
const adminEmail = arg("email");
const skipCatalogue = hasFlag("skip-catalogue");

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "./service-account.json";
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seedCatalogue() {
  console.log(`Seeding ${categories.length} categories...`);
  for (const [i, c] of categories.entries()) {
    await db
      .collection("categories")
      .doc(c.slug)
      .set(
        {
          slug: c.slug,
          name: c.name,
          shortName: c.shortName,
          description: c.description,
          icon: c.icon,
          order: i,
          active: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );
  }

  console.log(`Seeding ${products.length} products...`);
  for (const p of products) {
    await db
      .collection("products")
      .doc(p.slug)
      .set(
        {
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          description: p.description,
          specs: p.specs,
          color: p.color ?? null,
          images: categoryImages[p.category] ?? [],
          inStock: p.inStock,
          stockCount: p.stockCount ?? null,
          rating: p.rating ?? null,
          reviewCount: p.reviewCount ?? null,
          featured: Boolean(p.badge),
          badge: p.badge ?? null,
          featureRank: p.featureRank ?? null,
          active: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );
  }
}

async function bootstrapAdmin(uid: string) {
  console.log(`Making users/${uid} an admin...`);
  await db
    .collection("users")
    .doc(uid)
    .set(
      {
        uid,
        email: adminEmail ?? "",
        role: "admin",
        createdAt: new Date(),
      },
      { merge: true }
    );
}

async function main() {
  if (!skipCatalogue) await seedCatalogue();
  if (adminUid) await bootstrapAdmin(adminUid);
  else if (skipCatalogue)
    throw new Error("--skip-catalogue needs --admin <uid> to do anything");
  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
