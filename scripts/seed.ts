/**
 * One-time / repeatable seed script: pushes the bundled catalogue into
 * Firestore so the storefront has real data to read once a Firebase
 * project is wired up.
 *
 * Usage:
 *   1. Add a Firebase service account key (Project settings -> Service
 *      accounts -> Generate new private key) and save it as
 *      service-account.json in the project root (already gitignored).
 *   2. npm run seed
 */
import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { products } from "../src/lib/data/products";
import { categories } from "../src/lib/data/categories";
import { categoryImages } from "../src/lib/data/categoryImages";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "./service-account.json";
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  console.log(`Seeding ${categories.length} categories...`);
  for (const c of categories) {
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
          updatedAt: new Date(),
        },
        { merge: true }
      );
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
