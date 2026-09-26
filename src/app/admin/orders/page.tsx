"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, MapPin, Copy, Printer, Truck } from "lucide-react";
import { adminOrders, adminUpdateOrder, type OrderPatch } from "@/lib/api/orders";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "@/context/ToastContext";
import { formatKES, toMsisdn } from "@/lib/format";
import { BRAND_NAME } from "@/lib/contact";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";
import { Pagination } from "@/components/admin/Pagination";

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "completed",
  "cancelled",
];
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed"];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-sky-100 text-sky-700",
  dispatched: "bg-violet-100 text-violet-700",
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

function formatDay(ymd: string) {
  return new Date(`${ymd}T12:00:00`).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "short" });
}

/** A ready-to-send WhatsApp update for the order's current status, with a
 *  link to its tracking page. Built at click time (needs the site origin). */
function whatsappForOrder(o: Order): string {
  const first = o.customer.name.split(" ")[0] || "there";
  const trackUrl = `${window.location.origin}/track?ref=${encodeURIComponent(o.ref)}`;
  const pickup = o.deliveryMethod === "pickup";
  const update: Record<OrderStatus, string> = {
    pending: "we've received your order and will confirm it shortly.",
    confirmed: "your order is confirmed. We're getting it ready.",
    processing: pickup ? "your order is being prepared for collection." : "your order is being packed for delivery.",
    dispatched: [
      `your order is on its way${o.courier ? ` with ${o.courier}` : ""}.`,
      o.trackingNumber ? `Tracking number: ${o.trackingNumber}.` : "",
      o.expectedDelivery ? `Expected: ${formatDay(o.expectedDelivery)}.` : "",
    ].filter(Boolean).join(" "),
    completed: pickup ? "thanks for collecting your order! Enjoy it." : "your order has been delivered. Enjoy it!",
    cancelled: "your order has been cancelled. Reply here if you have any questions.",
  };
  const lines = [
    `Hi ${first} 👋`,
    "",
    `Update on your ${BRAND_NAME} order ${o.ref}: ${update[o.status]}`,
    o.paymentStatus === "paid" && o.status !== "cancelled" ? "Payment received — thank you." : "",
    "",
    ...o.items.map((i) => `• ${i.name}${i.color ? ` (${i.color})` : ""} ×${i.quantity}`),
    `Total: ${formatKES(o.total)}`,
    "",
    o.status === "cancelled" ? "" : `Track it any time: ${trackUrl}`,
  ].filter((l, i, all) => l !== "" || (all[i - 1] ?? "") !== "");
  return `https://wa.me/${toMsisdn(o.customer.phone)}?text=${encodeURIComponent(lines.join("\n").trim())}`;
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
          page,
          limit: PAGE,
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

  async function patchOrder(id: number, patch: OrderPatch, fail: string) {
    try {
      const updated = await adminUpdateOrder(id, patch);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return true;
    } catch (err) {
      push({ type: "error", message: errorMessage(err, fail) });
      void load();
      return false;
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
                    <button
                      type="button"
                      onClick={() => window.open(whatsappForOrder(o), "_blank", "noopener,noreferrer")}
                      title="Opens WhatsApp with a status update and tracking link — review and send"
                      className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Notify customer
                    </button>
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

                {o.deliveryMethod === "courier" && o.status !== "cancelled" && (
                  <CourierDetails
                    order={o}
                    onSave={async (patch) => {
                      const ok = await patchOrder(o.id, patch, "Couldn't save delivery details");
                      if (ok) push({ type: "success", message: "Delivery details saved — the customer sees them on Track Order" });
                      return ok;
                    }}
                  />
                )}

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

          <Pagination
            page={page}
            pageSize={PAGE}
            total={total}
            label="orders"
            onPage={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
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

/** Courier, tracking number and expected date for courier orders — shown to
 *  the customer on the Track Order page. Saving also marks the order
 *  "dispatched" if it hasn't got that far yet. */
function CourierDetails({ order, onSave }: { order: Order; onSave: (patch: OrderPatch) => Promise<boolean> }) {
  const [courier, setCourier] = useState(order.courier ?? "");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [expected, setExpected] = useState(order.expectedDelivery ?? "");
  const [saving, setSaving] = useState(false);
  const dirty =
    courier !== (order.courier ?? "") || tracking !== (order.trackingNumber ?? "") || expected !== (order.expectedDelivery ?? "");
  const early = ["pending", "confirmed", "processing"].includes(order.status);

  async function save() {
    setSaving(true);
    await onSave({
      courier: courier.trim() || null,
      trackingNumber: tracking.trim() || null,
      expectedDelivery: expected || null,
      ...(early && (courier.trim() || tracking.trim()) ? { status: "dispatched" as const } : {}),
    });
    setSaving(false);
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
        <Truck className="h-3.5 w-3.5" /> Delivery details
        <span className="font-normal text-muted">— shown to the customer on Track Order</span>
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          placeholder="Courier (e.g. G4S, Wells Fargo)"
          aria-label="Courier"
          className="admin-input h-9"
        />
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking number"
          aria-label="Tracking number"
          className="admin-input h-9 font-mono"
        />
        <input
          type="date"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          aria-label="Expected delivery date"
          className="admin-input h-9 sm:w-40"
        />
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="h-9 rounded-[8px] bg-brand px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-40"
        >
          {saving ? "Saving…" : early && (courier.trim() || tracking.trim()) ? "Save & mark dispatched" : "Save"}
        </button>
      </div>
    </div>
  );
}
