import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import type { ReviewDoc } from "@/types/firestore";

const COLLECTION = "reviews";

export interface ReviewWithId extends ReviewDoc {
  id: string;
}

/** Prepared for a future reviews feature — not wired into the UI yet. */
export async function fetchApprovedReviews(productSku: string): Promise<ReviewWithId[]> {
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

export async function submitReview(data: Omit<ReviewDoc, "approved" | "createdAt">) {
  if (!db) throw new Error("Firebase is not configured");
  await addDoc(collection(db, COLLECTION), {
    ...data,
    approved: false,
    createdAt: serverTimestamp(),
  });
}
