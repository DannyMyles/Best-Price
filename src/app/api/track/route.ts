import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { OrderDoc } from "@/types/firestore";

export const runtime = "nodejs";

function digits(s: string) {
  return (s || "").replace(/\D/g, "");
}

/** Loose match: last 9 digits equal (handles 07…, 2547…, +2547…). */
function phoneMatches(a: string, b: string) {
  const da = digits(a).slice(-9);
  const db = digits(b).slice(-9);
  return da.length === 9 && da === db;
}

export async function POST(request: Request) {
  if (!isAdminConfigured || !adminDb) {
    return NextResponse.json(
      {
        error:
          "Order tracking isn't available yet. Message us on WhatsApp with your order reference and we'll check for you.",
      },
      { status: 503 }
    );
  }

  let body: { ref?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ref = (body.ref ?? "").trim().toUpperCase();
  const phone = (body.phone ?? "").trim();
  if (!ref || digits(phone).length < 9) {
    return NextResponse.json(
      { error: "Enter your order reference and the phone number you ordered with." },
      { status: 400 }
    );
  }

  try {
    const snap = await adminDb
      .collection("orders")
      .where("ref", "==", ref)
      .limit(1)
      .get();

    const docSnap = snap.docs[0];
    const order = docSnap?.data() as OrderDoc | undefined;

    if (!order || !phoneMatches(order.customer?.phone ?? "", phone)) {
      return NextResponse.json(
        { error: "No order found with that reference and phone number." },
        { status: 404 }
      );
    }

    const createdAt =
      order.createdAt && "toDate" in order.createdAt
        ? (order.createdAt as { toDate: () => Date }).toDate().toISOString()
        : null;
    const updatedAt =
      order.updatedAt && "toDate" in order.updatedAt
        ? (order.updatedAt as { toDate: () => Date }).toDate().toISOString()
        : null;

    // Only return what the customer needs — never the full record.
    return NextResponse.json({
      ref: order.ref ?? ref,
      status: order.status ?? "pending",
      paymentStatus: order.paymentStatus ?? "pending",
      placedAt: createdAt,
      updatedAt,
      deliveryMethod: order.deliveryMethod ?? null,
      county: order.customer?.county ?? null,
      itemCount: (order.items ?? []).reduce((n, i) => n + (i.quantity ?? 0), 0),
      total: order.total ?? order.subtotal ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't look that up right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
