import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { ProductDoc } from "@/types/firestore";
import type { Product, CategorySlug } from "@/lib/types";

const COLLECTION = "products";

function fromDoc(id: string, data: ProductDoc): Product {
  return {
    sku: data.sku,
    slug: id,
    name: data.name,
    category: data.category,
    price: data.price,
    compareAtPrice: data.compareAtPrice ?? null,
    description: data.description,
    specs: data.specs ?? [],
    color: data.color,
    inStock: data.inStock,
    stockCount: data.stockCount ?? null,
    rating: data.rating ?? null,
    reviewCount: data.reviewCount ?? null,
    badge: data.badge ?? undefined,
    images: data.images ?? [],
    featured: data.featured,
    active: data.active ?? true,
    featureRank: data.featureRank ?? null,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy("name")));
  return snap.docs.map((d) => fromDoc(d.id, d.data() as ProductDoc));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDoc(doc(db, COLLECTION, slug));
  return snap.exists() ? fromDoc(snap.id, snap.data() as ProductDoc) : null;
}

export async function fetchProductsByCategory(category: CategorySlug): Promise<Product[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("category", "==", category))
  );
  return snap.docs.map((d) => fromDoc(d.id, d.data() as ProductDoc));
}

export async function fetchFeaturedProducts(max = 8): Promise<Product[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("featured", "==", true), fbLimit(max))
  );
  return snap.docs.map((d) => fromDoc(d.id, d.data() as ProductDoc));
}

/** Admin only — enforced by Firestore security rules. */
export async function upsertProduct(slug: string, data: Omit<ProductDoc, "createdAt" | "updatedAt">) {
  if (!db) throw new Error("Firebase is not configured");
  const ref = doc(db, COLLECTION, slug);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

/** Admin only — enforced by Firestore security rules. */
export async function setProductActive(slug: string, active: boolean) {
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, COLLECTION, slug), {
    active,
    updatedAt: serverTimestamp(),
  });
}

/** Admin only — enforced by Firestore security rules. */
export async function removeProduct(slug: string) {
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, COLLECTION, slug));
}
