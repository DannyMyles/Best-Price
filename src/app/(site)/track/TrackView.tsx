"use client";

import { useState } from "react";
import { Check, Loader2, Package, XCircle, MessageCircle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { formatKES } from "@/lib/format";
import { whatsappLink } from "@/lib/contact";
import { cn } from "@/lib/cn";

interface TrackResult {
  ref: string;
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  placedAt: string | null;
  updatedAt: string | null;
  deliveryMethod: "pickup" | "courier" | null;
  county: string | null;
  itemCount: number;
  total: number | null;
}

const STEPS = [
  { key: "pending", label: "Order received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Preparing your order" },
  { key: "completed", label: "Delivered / collected" },
] as const;

export function TrackView() {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data as TrackResult);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const currentIdx = result
    ? STEPS.findIndex((s) => s.key === result.status)
    : -1;
  const cancelled = result?.status === "cancelled";

  return (
    <div className="section max-w-2xl py-10 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Track your order
      </h1>
      <p className="mt-2 text-sm text-muted">
        Enter the order reference from your confirmation (e.g. <b>PH-4F2K</b>) and
        the phone number you ordered with.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/70">
            Order reference
          </span>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="PH-4F2K"
            className="field uppercase"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/70">
            Phone number
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            inputMode="tel"
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
            href={whatsappLink(
              `Hi PriceHub, I need help tracking order ${ref || "(ref)"}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1.5 font-semibold text-brand hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> Ask us on WhatsApp
          </a>
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Order {result.ref}</p>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                result.paymentStatus === "paid"
                  ? "bg-success-050 text-success"
                  : result.paymentStatus === "failed"
                    ? "bg-danger-050 text-danger"
                    : "bg-warning-050 text-warning"
              )}
            >
              Payment: {result.paymentStatus}
            </span>
          </div>

          <p className="mt-1 text-xs text-muted">
            {result.itemCount} item{result.itemCount !== 1 && "s"}
            {result.total != null && ` · ${formatKES(result.total)}`}
            {result.deliveryMethod &&
              ` · ${result.deliveryMethod === "pickup" ? "CBD pickup" : `courier to ${result.county ?? "your area"}`}`}
            {result.placedAt &&
              ` · placed ${new Date(result.placedAt).toLocaleDateString("en-KE")}`}
          </p>

          {cancelled ? (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-050 p-4 text-sm text-ink">
              <XCircle className="h-4 w-4 text-danger" /> This order was cancelled.
              Contact us if that&apos;s unexpected.
            </div>
          ) : (
            <ol className="mt-5 space-y-4">
              {STEPS.map((step, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
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
                      <p
                        className={cn(
                          "text-sm font-medium",
                          active ? "text-ink" : "text-ink/70"
                        )}
                      >
                        {step.label}
                      </p>
                      {active && result.updatedAt && (
                        <p className="text-xs text-muted">
                          Updated{" "}
                          {new Date(result.updatedAt).toLocaleString("en-KE")}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
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
