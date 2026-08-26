import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { OrderDoc, OrderStatus, PaymentStatus } from "@/types/firestore";

const COLLECTION = "orders";

export interface OrderWithId extends OrderDoc {
  id: string;
}

/** Anyone can create an order for themselves (checkout). */
export async function createOrder(
  data: Omit<OrderDoc, "status" | "paymentStatus" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) throw new Error("Firebase is not configured");
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: "pending" satisfies OrderStatus,
    paymentStatus: "pending" satisfies PaymentStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Admin only — enforced by Firestore security rules. */
export async function fetchAllOrders(): Promise<OrderWithId[]> {
  if (!db) throw new Error("Firebase is not configured");
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as OrderDoc) }));
}

/** Admin only — enforced by Firestore security rules. */
export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: serverTimestamp() });
}

/** Admin only — enforced by Firestore security rules. */
export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
  if (!db) throw new Error("Firebase is not configured");
  await updateDoc(doc(db, COLLECTION, id), { paymentStatus, updatedAt: serverTimestamp() });
}
