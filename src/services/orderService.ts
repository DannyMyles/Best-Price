import { isFirebaseConfigured } from "@/lib/firebase/config";
import { createOrder } from "@/lib/firebase/orders";
import type { OrderDoc } from "@/types/firestore";

/**
 * Records the order in Firestore when a project is configured. Checkout
 * still completes via WhatsApp either way, so a Firestore failure here
 * should never block the customer.
 */
export async function placeOrder(
  data: Omit<OrderDoc, "status" | "paymentStatus" | "createdAt" | "updatedAt">
): Promise<string | null> {
  if (!isFirebaseConfigured) return null;
  try {
    return await createOrder(data);
  } catch (err) {
    console.error("Failed to record order in Firestore", err);
    return null;
  }
}
