"use client";

import { useMemo, useState } from "react";
import { MessageCircle, MapPin, Copy } from "lucide-react";
import {
  fetchAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  type OrderWithId,
} from "@/lib/firebase/orders";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/context/ToastContext";
import { formatKES, toMsisdn } from "@/lib/format";
import { BRAND_NAME } from "@/lib/contact";
import type { OrderStatus, PaymentStatus } from "@/types/firestore";

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "completed",
  "cancelled",
];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed"];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-sky-100 text-sky-700",
  completed: "bg-success/10 text-success",
  cancelled: "bg-red-100 text-red-600",
};

const PAGE = 15;
const KEY = "admin:orders";

function orderTotal(o: OrderWithId): number {
  return o.total ?? o.subtotal + (o.deliveryFee ?? 0);
}

function fmtDate(o: OrderWithId): string {
  const d = o.createdAt?.toDate?.();
  if (!d) return "—";
  return d.toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function whatsappForOrder(o: OrderWithId): string {
  const lines = [
    `Hi ${o.customer.name.split(" ")[0] || "there"} 👋`,
    "",
    `About your ${BRAND_NAME} order${o.ref ? ` ${o.ref}` : ""}:`,
    ...o.items.map(
      (i) =>
        `• ${i.name}${i.color ? ` (${i.color})` : ""} ×${i.quantity}`
    ),
    "",
    `Total: ${formatKES(orderTotal(o))}`,
  ];
  return `https://wa.me/${toMsisdn(o.customer.phone)}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

export default function AdminOrdersPage() {
  const { push } = useToast();
  const { data, loading, error, refresh, mutate } = useAdminData<OrderWithId[]>(
    KEY,
    fetchAllOrders,
    isFirebaseConfigured
  );
  const orders = useMemo(() => data ?? [], [data]);

  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!needle) return true;
      return (
        (o.ref ?? "").toLowerCase().includes(needle) ||
        o.customer.name.toLowerCase().includes(needle) ||
        o.customer.phone.replace(/\D/g, "").includes(needle.replace(/\D/g, ""))
      );
    });
  }, [orders, filter, q]);

  const visible = filtered.slice(0, limit);

  async function handleStatusChange(id: string, status: OrderStatus) {
    mutate(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(id, status);
    } catch {
      push({ type: "error", message: "Couldn't update status" });
      refresh();
    }
  }

  async function handlePaymentChange(id: string, paymentStatus: PaymentStatus) {
    mutate(orders.map((o) => (o.id === id ? { ...o, paymentStatus } : o)));
    try {
      await updatePaymentStatus(id, paymentStatus);
    } catch {
      push({ type: "error", message: "Couldn't update payment status" });
      refresh();
    }
  }

  function copyRef(ref?: string) {
    if (!ref) return;
    navigator.clipboard?.writeText(ref);
    push({ type: "success", message: `Copied ${ref}` });
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
        Firebase isn&apos;t configured — add your project credentials to{" "}
        <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">
          .env.local
        </code>{" "}
        to see orders.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-ink">Orders</h1>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Search ref, name or phone"
          className="input h-9 w-56 py-1.5"
        />
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...statuses] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setLimit(PAGE);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-brand text-white"
                  : "bg-surface-muted text-ink/70 hover:text-ink"
              }`}
            >
              {s}
              {s !== "all" && (
                <span className="ml-1 opacity-70">
                  {orders.filter((o) => o.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load orders.{" "}
          <button onClick={() => refresh()} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {orders.length === 0 ? "No orders yet." : "No orders match that filter."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {visible.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-border bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {o.ref && (
                        <button
                          onClick={() => copyRef(o.ref)}
                          className="flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs font-semibold text-ink hover:bg-brand-050 hover:text-brand"
                          title="Copy reference"
                        >
                          {o.ref} <Copy className="h-3 w-3" />
                        </button>
                      )}
                      <span className="text-sm font-semibold text-ink">
                        {o.customer.name}
                      </span>
                      <span className="text-xs text-muted">{fmtDate(o)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {o.customer.phone}
                      {o.customer.email ? ` · ${o.customer.email}` : ""}
                    </p>
                    <p className="mt-0.5 flex items-start gap-1 text-xs text-muted">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        {o.deliveryMethod === "pickup"
                          ? "Pickup — Bihi Towers"
                          : [o.customer.town, o.customer.county, o.customer.address]
                              .filter(Boolean)
                              .join(", ") || "Courier"}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        handleStatusChange(o.id, e.target.value as OrderStatus)
                      }
                      className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize ${statusStyles[o.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <a
                      href={whatsappForOrder(o)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Message
                    </a>
                  </div>
                </div>

                <div className="mt-3 divide-y divide-border border-t border-border pt-3">
                  {o.items.map((item) => (
                    <div
                      key={item.sku}
                      className="flex justify-between py-1.5 text-sm"
                    >
                      <span className="text-ink/80">
                        {item.name}
                        {item.color ? ` · ${item.color}` : ""}{" "}
                        <span className="text-muted">x{item.quantity}</span>
                      </span>
                      <span className="text-ink">
                        {item.price === null
                          ? "POA"
                          : formatKES(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                  <Row label="Subtotal" value={formatKES(o.subtotal)} />
                  {typeof o.deliveryFee === "number" && (
                    <Row
                      label={`Delivery${o.deliveryMethod ? ` (${o.deliveryMethod})` : ""}`}
                      value={
                        o.deliveryFee === 0 ? "Free" : formatKES(o.deliveryFee)
                      }
                    />
                  )}
                  <div className="flex justify-between pt-1 font-semibold text-ink">
                    <span>Total</span>
                    <span>{formatKES(orderTotal(o))}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
                  <span className="capitalize text-muted">
                    {o.paymentMethod}
                  </span>
                  <label className="flex items-center gap-1.5 text-muted">
                    Payment:
                    <select
                      value={o.paymentStatus}
                      onChange={(e) =>
                        handlePaymentChange(
                          o.id,
                          e.target.value as PaymentStatus
                        )
                      }
                      className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium capitalize ${
                        o.paymentStatus === "paid"
                          ? "bg-success/10 text-success"
                          : o.paymentStatus === "failed"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {paymentStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  {o.mpesaCode && (
                    <span className="text-muted">
                      M-Pesa: <b className="text-ink">{o.mpesaCode}</b>
                      {o.mpesaName ? ` · ${o.mpesaName}` : ""}
                    </span>
                  )}
                  {o.notes && (
                    <span className="text-muted">Note: {o.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {limit < filtered.length && (
            <button
              onClick={() => setLimit((l) => l + PAGE)}
              className="mx-auto mt-6 block rounded-full border border-border px-5 py-2 text-sm font-medium text-ink hover:border-brand/40"
            >
              Load more ({filtered.length - limit})
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
