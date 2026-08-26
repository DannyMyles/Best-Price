import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
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
  };
}

export async function fetchAllCategories(): Promise<Category[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(query(collection(db, COLLECTION), where("active", "==", true)));
  return snap.docs.map((d) => fromDoc(d.id, d.data() as CategoryDoc));
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
export async function removeCategory(slug: string) {
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, COLLECTION, slug));
}
