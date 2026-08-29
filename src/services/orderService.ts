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
  let id: string | null = null;
  try {
    id = await createOrder(data);
  } catch (err) {
    console.error("Failed to record order in Firestore", err);
  }

  // Fire-and-forget stock decrement (server-side, Admin SDK). Never blocks
  // checkout; silently no-ops if the Admin SDK isn't configured.
  if (id) {
    void fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: (data.items ?? []).map((i) => ({
          slug: i.slug,
          quantity: i.quantity,
        })),
      }),
    }).catch(() => {});
  }

  return id;
}
