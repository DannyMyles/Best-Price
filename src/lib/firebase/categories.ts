import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { CategoryDoc } from "@/types/firestore";
import type { Category } from "@/lib/types";

const COLLECTION = "categories";

function fromDoc(id: string, data: CategoryDoc): Category {
  return {
    slug: data.slug ?? (id as Category["slug"]),
    name: data.name,
    shortName: data.shortName,
    description: data.description,
    icon: data.icon as Category["icon"],
    active: data.active ?? true,
    order: data.order ?? 0,
  };
}

function byOrderThenName(a: Category, b: Category) {
  return (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name);
}

/** Storefront: only active categories, sorted by nav order. */
export async function fetchAllCategories(): Promise<Category[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("active", "==", true))
  );
  return snap.docs
    .map((d) => fromDoc(d.id, d.data() as CategoryDoc))
    .sort(byOrderThenName);
}

/** Admin: every category including hidden ones. */
export async function fetchAllCategoriesAdmin(): Promise<Category[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map((d) => fromDoc(d.id, d.data() as CategoryDoc))
    .sort(byOrderThenName);
}

/** How many products currently reference this category slug. */
export async function countProductsInCategory(slug: string): Promise<number> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getCountFromServer(
    query(collection(db, "products"), where("category", "==", slug))
  );
  return snap.data().count;
}

/** Moves every product from one category slug to another. Returns the count
 *  moved. Firestore batches cap at 500 writes, so we chunk. */
export async function reassignProductsCategory(
  fromSlug: string,
  toSlug: string
): Promise<number> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(
    query(collection(db, "products"), where("category", "==", fromSlug))
  );
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    for (const d of docs.slice(i, i + 400)) {
      batch.update(d.ref, {
        category: toSlug,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }
  return docs.length;
}

/** Admin only — enforced by Firestore security rules. */
export async function upsertCategory(
  slug: string,
  data: Omit<CategoryDoc, "createdAt" | "updatedAt">
) {
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
export async function setCategoryActive(slug: string, active: boolean) {
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, COLLECTION, slug), {
    active,
    updatedAt: serverTimestamp(),
  });
}

/** Admin only — enforced by Firestore security rules. */
export async function removeCategory(slug: string) {
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, COLLECTION, slug));
}
