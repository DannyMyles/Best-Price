import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";
import type { UserDoc } from "@/types/firestore";

/** Reads the caller's own users/{uid} doc to check their role — allowed by
 *  security rules since a user may always read their own profile. */
export async function fetchUserRole(uid: string): Promise<UserDoc["role"] | null> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserDoc).role : null;
}
