import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  where,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { BannerDoc } from "@/types/firestore";
import type { Banner } from "@/lib/types";
import { sortBanners } from "@/lib/data/banners";

const COLLECTION = "banners";

function fromDoc(id: string, data: BannerDoc): Banner {
  return {
    id,
    eyebrow: data.eyebrow,
    headline: data.headline,
    subcopy: data.subcopy,
    image: data.image,
    badge: data.badge,
    ctaLabel: data.ctaLabel,
    ctaHref: data.ctaHref,
    dealEndsAt: data.dealEndsAt ?? null,
    active: data.active ?? true,
    order: data.order ?? 0,
  };
}

/** Storefront: only active slides, sorted for display. */
export async function fetchActiveBanners(): Promise<Banner[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("active", "==", true))
  );
  return sortBanners(snap.docs.map((d) => fromDoc(d.id, d.data() as BannerDoc)));
}

/** Admin: every slide including hidden ones, in display order. */
export async function fetchAllBannersAdmin(): Promise<Banner[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map((d) => fromDoc(d.id, d.data() as BannerDoc))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Admin only — enforced by Firestore security rules. Creates when `id` is
 *  omitted, otherwise updates in place. */
export async function upsertBanner(
  id: string | null,
  data: Omit<BannerDoc, "createdAt" | "updatedAt">
) {
  if (!db) throw new Error("Firebase is not configured");
  if (!id) {
    await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }
  const ref = doc(db, COLLECTION, id);
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
export async function setBannerActive(id: string, active: boolean) {
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, COLLECTION, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

/** Admin only — enforced by Firestore security rules. Persists a new drag
 *  order for every slide in one batch. */
export async function reorderBanners(orderedIds: string[]) {
  if (!db) throw new Error("Firebase is not configured");
  const database = db;
  const batch = writeBatch(database);
  orderedIds.forEach((id, i) => {
    batch.update(doc(database, COLLECTION, id), { order: i, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

/** Admin only — enforced by Firestore security rules. */
export async function removeBanner(id: string) {
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, COLLECTION, id));
}
