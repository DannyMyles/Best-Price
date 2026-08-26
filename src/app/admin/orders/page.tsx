"use client";

import { useEffect, useState } from "react";
import { fetchAllOrders, updateOrderStatus, type OrderWithId } from "@/lib/firebase/orders";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { formatKES } from "@/lib/format";
import type { OrderStatus } from "@/types/firestore";

const statuses: OrderStatus[] = ["pending", "confirmed", "processing", "completed", "cancelled"];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-sky-100 text-sky-700",
  completed: "bg-success/10 text-success",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithId[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    fetchAllOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await updateOrderStatus(id, status);
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
        Firebase isn&apos;t configured — add your project credentials to{" "}
        <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">.env.local</code> to see orders.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-ink">Orders</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{o.customer.name}</p>
                  <p className="text-xs text-muted">{o.customer.phone} · {o.customer.address}</p>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                  className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize ${statusStyles[o.status]}`}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 divide-y divide-border border-t border-border pt-3">
                {o.items.map((item) => (
                  <div key={item.sku} className="flex justify-between py-1.5 text-sm">
                    <span className="text-ink/80">
                      {item.name} <span className="text-muted">x{item.quantity}</span>
                    </span>
                    <span className="text-ink">
                      {item.price === null ? "POA" : formatKES(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted capitalize">{o.paymentMethod} · {o.paymentStatus}</span>
                <span className="font-semibold text-ink">{formatKES(o.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
