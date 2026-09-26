"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { adminGetOrder } from "@/lib/api/orders";
import { formatKES } from "@/lib/format";
import { BRAND_NAME, STORE_ADDRESS, SUPPORT_PHONE_DISPLAY } from "@/lib/contact";
import type { Order } from "@/lib/types";

/** Printable order slip / invoice. The admin chrome is hidden when printing. */
export default function OrderSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrder(null);
      return;
    }
    adminGetOrder(n)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [id]);

  if (order === undefined) return <p className="text-sm text-muted">Loading…</p>;
  if (order === null) return <p className="text-sm text-muted">Order not found.</p>;

  const c = order.customer;
  const placed = new Date(order.createdAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm text-muted hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> All orders
        </Link>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <article className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 text-ink print:max-w-none print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-bold">{BRAND_NAME}</h1>
            <p className="mt-1 text-sm text-muted">{STORE_ADDRESS}</p>
            <p className="text-sm text-muted">{SUPPORT_PHONE_DISPLAY}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-semibold">{order.ref}</p>
            <p className="text-sm text-muted">{placed}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">
              {order.status} · payment {order.paymentStatus}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 border-b border-border py-5 text-sm sm:grid-cols-2">
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Customer</h2>
            <p className="font-medium">{c.name}</p>
            <p>{c.phone}</p>
            {c.email && <p>{c.email}</p>}
          </div>
          <div>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {order.deliveryMethod === "pickup" ? "Pickup" : "Deliver to"}
            </h2>
            {order.deliveryMethod === "pickup" ? (
              <p>Collect from the shop — {STORE_ADDRESS}</p>
            ) : (
              <p>{[c.address, c.town, c.county].filter(Boolean).join(", ")}</p>
            )}
          </div>
        </section>

        <table className="mt-5 w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.items.map((i) => (
              <tr key={`${i.sku}-${i.name}`}>
                <td className="py-2">
                  {i.name}
                  {i.color ? ` · ${i.color}` : ""}
                  <span className="block font-mono text-xs text-muted">{i.sku}</span>
                </td>
                <td className="py-2 text-right">{i.quantity}</td>
                <td className="py-2 text-right">{i.price == null ? "POA" : formatKES(i.price)}</td>
                <td className="py-2 text-right">{i.price == null ? "POA" : formatKES(i.price * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd>{formatKES(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery ({order.deliveryMethod})</dt>
            <dd>{order.deliveryFee === 0 ? "Free" : formatKES(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd>{formatKES(order.total)}</dd>
          </div>
        </dl>

        <footer className="mt-6 space-y-1 border-t border-border pt-4 text-sm text-muted">
          <p>
            Payment: <span className="capitalize">{order.paymentMethod}</span>
            {order.mpesaCode ? ` · M-Pesa code ${order.mpesaCode}` : ""}
            {order.mpesaName ? ` (${order.mpesaName})` : ""}
          </p>
          {order.notes && <p>Notes: {order.notes}</p>}
          <p className="pt-2">Thank you for shopping with {BRAND_NAME}.</p>
        </footer>
      </article>
    </div>
  );
}
