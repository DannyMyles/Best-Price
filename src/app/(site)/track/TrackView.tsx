"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Package, XCircle, MessageCircle, Truck, Clock, History, X } from "lucide-react";
import { trackOrder, type TrackedOrder } from "@/lib/api/orders";
import { ApiError, errorMessage } from "@/lib/api/client";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { formatKES } from "@/lib/format";
import { whatsappLink } from "@/lib/contact";
import { forgetOrder, getRecentOrders, rememberOrder, type RecentOrder } from "@/lib/recentOrders";
import { cn } from "@/lib/cn";

type Step = { key: TrackedOrder["status"]; label: string };

/** Pickup orders are never "dispatched"; courier orders get that extra step. */
function stepsFor(method: TrackedOrder["deliveryMethod"]): Step[] {
  return method === "courier"
    ? [
        { key: "pending", label: "Order received" },
        { key: "confirmed", label: "Confirmed" },
        { key: "processing", label: "Preparing your order" },
        { key: "dispatched", label: "On its way" },
        { key: "completed", label: "Delivered" },
      ]
    : [
        { key: "pending", label: "Order received" },
        { key: "confirmed", label: "Confirmed" },
        { key: "processing", label: "Preparing your order" },
        { key: "completed", label: "Collected" },
      ];
}

function formatDay(ymd: string) {
  const d = new Date(`${ymd}T12:00:00`);
  return d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
}

/** Payment line in plain language, instead of a bare "pending". */
function paymentNote(o: TrackedOrder): { tone: "ok" | "wait" | "bad"; text: string } {
  if (o.paymentStatus === "paid") return { tone: "ok", text: "Payment received" };
  if (o.paymentStatus === "failed") return { tone: "bad", text: "Payment not received — please contact us" };
  if (o.paymentMethod === "mpesa" && o.mpesaCodeSubmitted)
    return { tone: "wait", text: "M-Pesa code received — we're confirming your payment" };
  if (o.paymentMethod === "cod")
    return { tone: "wait", text: o.deliveryMethod === "pickup" ? "Pay when you collect" : "Pay on delivery" };
  return { tone: "wait", text: "Awaiting payment" };
}

export function TrackView() {
  const params = useSearchParams();
  const [ref, setRef] = useState(() => (params.get("ref") ?? "").toUpperCase());
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);

  async function lookup(r: string, p: string) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const found = await trackOrder(r.trim(), p.trim());
      setResult(found);
      rememberOrder({ ref: found.ref, phone: p.trim(), total: found.total, placedAt: found.placedAt });
      setRecent(getRecentOrders());
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "We couldn't find an order matching that reference and phone number."
          : errorMessage(err, "Something went wrong — please try again.")
      );
    } finally {
      setBusy(false);
    }
  }

  // Orders placed on this device; a ?ref= link that matches one is looked up straight away.
  useEffect(() => {
    const saved = getRecentOrders();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(saved);
    const fromLink = (params.get("ref") ?? "").toUpperCase();
    const match = fromLink && saved.find((o) => o.ref === fromLink);
    if (match) {
      setPhone(match.phone);
      void lookup(match.ref, match.phone);
    }
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(o: RecentOrder) {
    setRef(o.ref);
    setPhone(o.phone);
    void lookup(o.ref, o.phone);
  }

  function forget(r: string) {
    forgetOrder(r);
    setRecent(getRecentOrders());
  }

  const steps = result ? stepsFor(result.deliveryMethod) : [];
  const currentIdx = result ? steps.findIndex((s) => s.key === result.status) : -1;
  const cancelled = result?.status === "cancelled";
  const pay = result ? paymentNote(result) : null;
  const hasDispatch = Boolean(result && (result.courier || result.trackingNumber || result.expectedDelivery));

  return (
    <div className="section max-w-2xl py-10 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Track your order</h1>
      <p className="mt-2 text-sm text-muted">
        Enter the order reference from your confirmation (e.g. <b>PH-4F2K</b>) and the phone number you ordered with.
      </p>

      {recent.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink/70">
            <History className="h-3.5 w-3.5" /> Your recent orders on this device
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.map((o) => (
              <span
                key={o.ref}
                className={cn(
                  "group inline-flex items-center rounded-full border text-sm transition-colors",
                  result?.ref === o.ref ? "border-brand bg-brand-050" : "border-border bg-surface hover:border-border-strong"
                )}
              >
                <button type="button" onClick={() => pick(o)} className="py-1.5 pl-3.5 pr-1 text-left">
                  <span className="font-mono font-semibold text-ink">{o.ref}</span>
                  {o.total != null && <span className="ml-1.5 text-xs text-muted">{formatKES(o.total)}</span>}
                </button>
                <button
                  type="button"
                  onClick={() => forget(o.ref)}
                  aria-label={`Remove ${o.ref} from this device`}
                  className="mr-1 flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-black/5 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(ref, phone);
        }}
        className="chamfer mt-6 grid grid-cols-1 gap-3 border border-border bg-surface p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/70">Order reference</span>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="PH-4F2K"
            className="field uppercase"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/70">Phone number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            inputMode="tel"
            autoComplete="tel"
            className="field"
            required
          />
        </label>
        <AnimatedButton type="submit" variant="primary" isLoading={busy}>
          Track
        </AnimatedButton>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-ink">
          {error}
          <a
            href={whatsappLink(`Hi PriceHub, I need help tracking order ${ref || "(ref)"}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1.5 font-semibold text-brand hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Ask us on WhatsApp
          </a>
        </div>
      )}

      {result && pay && (
        <div className="chamfer mt-6 border border-border bg-surface p-6">
          <p className="font-mono text-sm font-semibold text-ink">Order {result.ref}</p>
          <p className="mt-1 text-xs text-muted">
            {result.itemCount} item{result.itemCount !== 1 && "s"}
            {result.total != null && ` · ${formatKES(result.total)}`}
            {` · ${result.deliveryMethod === "pickup" ? "CBD pickup" : `courier to ${result.county ?? "your area"}`}`}
            {result.placedAt && ` · placed ${new Date(result.placedAt).toLocaleDateString("en-KE")}`}
          </p>

          <p
            className={cn(
              "mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              pay.tone === "ok" && "bg-success-050 text-success",
              pay.tone === "wait" && "bg-warning-050 text-warning",
              pay.tone === "bad" && "bg-danger-050 text-danger"
            )}
          >
            {pay.tone === "ok" ? <Check className="h-4 w-4" /> : pay.tone === "bad" ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {pay.text}
          </p>

          {cancelled ? (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-ink">
              <XCircle className="h-4 w-4 text-danger" /> This order was cancelled. Contact us if that&apos;s unexpected.
            </div>
          ) : (
            <ol className="mt-5 space-y-4">
              {steps.map((step, i) => {
                const done = i < currentIdx || (i === currentIdx && step.key === "completed");
                const active = i === currentIdx && step.key !== "completed";
                return (
                  <li key={step.key} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        done && "bg-success text-white",
                        active && "bg-brand text-white",
                        !done && !active && "bg-surface-muted text-muted"
                      )}
                    >
                      {done ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : active ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <span className="text-[11px] font-bold">{i + 1}</span>
                      )}
                    </span>
                    <div>
                      <p className={cn("text-sm font-medium", active || done ? "text-ink" : "text-ink/60")}>{step.label}</p>
                      {i === currentIdx && result.updatedAt && (
                        <p className="text-xs text-muted">Updated {new Date(result.updatedAt).toLocaleString("en-KE")}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {hasDispatch && !cancelled && (
            <div className="mt-5 rounded-xl border border-border bg-surface-muted/60 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <Truck className="h-4 w-4 text-brand" /> Delivery details
              </p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                {result.courier && (
                  <>
                    <dt className="text-muted">Courier</dt>
                    <dd className="font-medium text-ink">{result.courier}</dd>
                  </>
                )}
                {result.trackingNumber && (
                  <>
                    <dt className="text-muted">Tracking no.</dt>
                    <dd className="font-mono font-medium text-ink">{result.trackingNumber}</dd>
                  </>
                )}
                {result.expectedDelivery && (
                  <>
                    <dt className="text-muted">Expected</dt>
                    <dd className="font-medium text-ink">{formatDay(result.expectedDelivery)}</dd>
                  </>
                )}
              </dl>
            </div>
          )}

          <a
            href={whatsappLink(`Hi PriceHub, an update on order ${result.ref}?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-fit items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-strong"
          >
            <Package className="h-4 w-4" /> Message us about this order
          </a>
        </div>
      )}
    </div>
  );
}
