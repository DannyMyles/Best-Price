"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, MapPin, Copy, Printer } from "lucide-react";
import { adminOrders, adminUpdateOrder } from "@/lib/api/orders";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import { formatKES, toMsisdn } from "@/lib/format";
import { BRAND_NAME } from "@/lib/contact";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

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

function fmtDate(o: Order): string {
  const d = new Date(o.createdAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function whatsappForOrder(o: Order): string {
  const lines = [
    `Hi ${o.customer.name.split(" ")[0] || "there"} 👋`,
    "",
    `About your ${BRAND_NAME} order${o.ref ? ` ${o.ref}` : ""}:`,
    ...o.items.map(
      (i) =>
        `• ${i.name}${i.color ? ` (${i.color})` : ""} ×${i.quantity}`
    ),
    "",
    `Total: ${formatKES(o.total)}`,
  ];
  return `https://wa.me/${toMsisdn(o.customer.phone)}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

export default function AdminOrdersPage() {
  const { push } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(
    async (signal?: { cancelled: boolean }) => {
      setLoading(true);
      setError(false);
      try {
        const res = await adminOrders({
          status: filter === "all" ? undefined : filter,
          q: debouncedQ || undefined,
          page: 1,
          limit: page * PAGE,
        });
        if (signal?.cancelled) return;
        setOrders(res.items);
        setTotal(res.total);
      } catch {
        if (!signal?.cancelled) setError(true);
      } finally {
        if (!signal?.cancelled) setLoading(false);
      }
    },
    [filter, debouncedQ, page]
  );

  useEffect(() => {
    const signal = { cancelled: false };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  async function patchOrder(id: number, patch: { status?: OrderStatus; paymentStatus?: PaymentStatus }, fail: string) {
    try {
      const updated = await adminUpdateOrder(id, patch);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      push({ type: "error", message: errorMessage(err, fail) });
      void load();
    }
  }

  const handleStatusChange = (id: number, status: OrderStatus) =>
    patchOrder(id, { status }, "Couldn't update status");
  const handlePaymentChange = (id: number, paymentStatus: PaymentStatus) =>
    patchOrder(id, { paymentStatus }, "Couldn't update payment status");

  function copyRef(ref?: string) {
    if (!ref) return;
    navigator.clipboard?.writeText(ref);
    push({ type: "success", message: `Copied ${ref}` });
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-ink">Orders</h1>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ref, name or phone"
          className="input h-9 w-56 py-1.5"
        />
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...statuses] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-brand text-white"
                  : "bg-surface-muted text-ink/70 hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : error ? (
        <div className="rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-danger">
          Couldn&apos;t load orders — is the backend running?{" "}
          <button onClick={() => load()} className="font-semibold underline">
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted">
          {filter === "all" && !debouncedQ ? "No orders yet." : "No orders match that filter."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((o) => (
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
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand/40"
                    >
                      <Printer className="h-3.5 w-3.5" /> Slip
                    </Link>
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
                    <span>{formatKES(o.total)}</span>
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

          {orders.length < total && (
            <button
              disabled={loading}
              onClick={() => setPage((p) => p + 1)}
              className="mx-auto mt-6 block rounded-full border border-border px-5 py-2 text-sm font-medium text-ink hover:border-brand/40"
            >
              Load more ({total - orders.length})
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
