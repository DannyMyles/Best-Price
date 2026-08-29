import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Best-effort stock decrement, called (fire-and-forget) after an order is
 * placed. Uses the Admin SDK so products stay locked down to admins in
 * Firestore rules. Only touches products that already track `stockCount`.
 */
export async function POST(request: Request) {
  if (!isAdminConfigured || !adminDb) {
    return NextResponse.json({ ok: false, reason: "admin-not-configured" });
  }

  let items: { slug?: string; quantity?: number }[];
  try {
    const body = await request.json();
    items = Array.isArray(body?.items) ? body.items : [];
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  const clean = items
    .filter((i) => typeof i.slug === "string" && Number(i.quantity) > 0)
    .map((i) => ({ slug: i.slug as string, quantity: Math.floor(Number(i.quantity)) }));

  if (clean.length === 0) return NextResponse.json({ ok: true, updated: 0 });

  try {
    const batch = adminDb.batch();
    let updated = 0;
    for (const it of clean) {
      const ref = adminDb.collection("products").doc(it.slug);
      const snap = await ref.get();
      if (typeof snap.data()?.stockCount === "number") {
        batch.update(ref, {
          stockCount: FieldValue.increment(-it.quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });
        updated++;
      }
    }
    if (updated > 0) await batch.commit();
    return NextResponse.json({ ok: true, updated });
  } catch {
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
