import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { ReviewDoc } from "@/types/firestore";

const COLLECTION = "reviews";

export interface ReviewWithId extends ReviewDoc {
  id: string;
}

/** Storefront: approved reviews for one product. */
export async function fetchApprovedReviews(
  productSku: string
): Promise<ReviewWithId[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("productSku", "==", productSku),
      where("approved", "==", true),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ReviewDoc) }));
}

/** Admin only — every review, newest first. Enforced by security rules
 *  (`isAdmin()` short-circuits the per-doc `approved == true` check). */
export async function fetchAllReviews(): Promise<ReviewWithId[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ReviewDoc) }));
}

/** Anyone may submit a review; it starts unapproved. */
export async function submitReview(
  data: Omit<ReviewDoc, "approved" | "createdAt">
) {
  if (!db) throw new Error("Firebase is not configured");
  await addDoc(collection(db, COLLECTION), {
    ...data,
    approved: false,
    createdAt: serverTimestamp(),
  });
}

/** Admin only — publish / unpublish a review. */
export async function setReviewApproved(id: string, approved: boolean) {
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, COLLECTION, id), { approved });
}

/** Admin only — permanently remove a review. */
export async function deleteReview(id: string) {
  if (!db) throw new Error("Firebase is not configured");
  await deleteDoc(doc(db, COLLECTION, id));
}
