"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Pencil,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatKES, toMsisdn, formatPhoneKE } from "@/lib/format";
import {
  WHATSAPP_NUMBER,
  MPESA_PAYBILL_NUMBER,
  STORE_ADDRESS,
} from "@/lib/contact";
import { counties } from "@/lib/data/counties";
import {
  deliveryOptions,
  deliveryFeeFor,
  deliveryEtaFor,
  type DeliveryMethod,
} from "@/lib/data/delivery";
import { placeOrder } from "@/services/orderService";
import { AnimatedButton, AnimatedLinkButton } from "@/components/ui/AnimatedButton";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { MpesaInstructions } from "@/components/checkout/MpesaInstructions";

const DRAFT_KEY = "pricehub-checkout-draft";

const paymentMethods = [
  { value: "mpesa", label: "M-Pesa", hint: "Send Money — recommended" },
  { value: "cod", label: "Cash on Delivery", hint: "Pay the rider on arrival" },
  { value: "bank", label: "Bank Transfer", hint: "We share account details" },
] as const;
type PaymentValue = (typeof paymentMethods)[number]["value"];

interface Draft {
  name: string;
  phone: string;
  email: string;
  county: string;
  town: string;
  address: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  payment: PaymentValue;
  mpesaName: string;
}

const emptyDraft: Draft = {
  name: "",
  phone: "",
  email: "",
  county: "",
  town: "",
  address: "",
  notes: "",
  deliveryMethod: "pickup",
  payment: "mpesa",
  mpesaName: "",
};

export default function CheckoutPage() {
  const { lines, subtotal, hasPOAItems, clearCart } = useCart();
  const { push } = useToast();

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mpesaCode, setMpesaCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [placedSnapshot, setPlacedSnapshot] = useState<{
    items: typeof lines;
    total: number;
    deliveryFee: number;
  } | null>(null);
  const hydrated = useRef(false);

  // Load + persist the draft so nothing is re-typed on a refresh.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      const saved = raw
        ? { ...emptyDraft, ...(JSON.parse(raw) as Partial<Draft>) }
        : { ...emptyDraft };
      // Prefill the county from the product-page delivery estimator.
      if (!saved.county) {
        saved.county = window.localStorage.getItem("pricehub-county") ?? "";
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(saved);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const deliveryFee = useMemo(
    () => deliveryFeeFor(draft.deliveryMethod, draft.county || null),
    [draft.deliveryMethod, draft.county]
  );
  const total = subtotal + deliveryFee;

  function validateDetails() {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = "Enter your full name";
    const msisdn = toMsisdn(draft.phone);
    if (!/^254(7|1)\d{8}$/.test(msisdn))
      e.phone = "Enter a valid Safaricom number, e.g. 0712 345 678";
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))
      e.email = "Enter a valid email or leave it blank";
    if (!draft.county) e.county = "Select your county";
    if (!draft.town.trim()) e.town = "Enter your town or area";
    if (draft.deliveryMethod === "courier" && !draft.address.trim())
      e.address = "Enter a delivery address for courier";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 0 && !validateDetails()) {
      push({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildMessage(ref: string) {
    const itemLines = lines
      .map(
        (l) =>
          `• ${l.name}${l.color ? ` (${l.color})` : ""} x${l.quantity} — ${
            l.price === null ? "POA" : formatKES(l.price * l.quantity)
          }`
      )
      .join("\n");
    const method = paymentMethods.find((p) => p.value === draft.payment)?.label;
    return [
      `New PriceHub order ${ref}`,
      "",
      itemLines,
      "",
      `Subtotal: ${formatKES(subtotal)}`,
      `Delivery (${draft.deliveryMethod}): ${formatKES(deliveryFee)}`,
      `Total: ${formatKES(total)}${hasPOAItems ? " (+ items on request)" : ""}`,
      "",
      `Name: ${draft.name}`,
      `Phone: ${formatPhoneKE(draft.phone)}`,
      draft.email ? `Email: ${draft.email}` : undefined,
      `Location: ${draft.town}, ${draft.county}`,
      draft.address ? `Address: ${draft.address}` : undefined,
      `Payment: ${method}`,
      draft.payment === "mpesa" && mpesaCode
        ? `M-Pesa code: ${mpesaCode.toUpperCase()}`
        : undefined,
      draft.notes ? `Notes: ${draft.notes}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function handlePlace() {
    setSubmitting(true);
    // Generate the customer-facing reference up front and store it on the
    // order so /track can look it up by ref + phone.
    const ref = `PH-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random()
      .toString(36)
      .toUpperCase()
      .slice(2, 4)}`;
    try {
      await placeOrder({
        ref,
        customer: {
          name: draft.name.trim(),
          phone: toMsisdn(draft.phone),
          email: draft.email.trim() || undefined,
          address: draft.address.trim(),
          county: draft.county,
          town: draft.town.trim(),
        },
        items: lines.map((l) => ({
          sku: l.sku,
          name: l.name,
          slug: l.slug,
          price: l.price,
          color: l.color,
          quantity: l.quantity,
        })),
        subtotal,
        deliveryMethod: draft.deliveryMethod,
        deliveryFee,
        total,
        paymentMethod: draft.payment,
        mpesaCode: mpesaCode.trim().toUpperCase() || undefined,
        mpesaName: draft.mpesaName.trim() || undefined,
        notes: draft.notes.trim() || undefined,
      });
    } catch {
      push({
        type: "error",
        message: "Couldn't save the order online — we'll take it over WhatsApp",
      });
    }

    setPlacedSnapshot({ items: lines, total, deliveryFee });
    try {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(ref))}`,
        "_blank"
      );
    } catch {
      /* popup blocked — the confirmation screen still has a WhatsApp link */
    }
    setOrderRef(ref);
    setSubmitting(false);
    setPlaced(true);
    clearCart();
    window.localStorage.removeItem(DRAFT_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---- Confirmation ---- */
  if (placed && orderRef && placedSnapshot) {
    const trackMsg = `Hi PriceHub, I'd like to track my order ${orderRef}.`;
    return (
      <div className="section max-w-2xl py-12 sm:py-16">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-050">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink">Order placed</h1>
          <p className="mt-1.5 text-sm text-muted">
            We&apos;ve opened WhatsApp with your order — send the message so our
            team can confirm payment and delivery.
          </p>
          <p className="mt-3 inline-block rounded-full bg-surface-muted px-4 py-1.5 text-sm font-semibold text-ink">
            Order {orderRef}
          </p>

          <div className="mt-6 space-y-2 rounded-xl border border-border bg-surface-muted/40 p-4 text-left text-sm">
            {placedSnapshot.items.map((l) => (
              <div key={l.sku} className="flex justify-between">
                <span className="text-ink/80">
                  {l.name} <span className="text-muted">×{l.quantity}</span>
                </span>
                <span className="font-medium text-ink">
                  {l.price === null ? "POA" : formatKES(l.price * l.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 text-muted">
              <span>Delivery ({draft.deliveryMethod})</span>
              <span>{formatKES(placedSnapshot.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ink">
              <span>Total</span>
              <span>{formatKES(placedSnapshot.total)}</span>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl border border-border p-4 text-left text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Payment</dt>
              <dd className="font-medium text-ink">
                {paymentMethods.find((p) => p.value === draft.payment)?.label}
                {draft.payment === "mpesa" && ` · ${MPESA_PAYBILL_NUMBER}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Deliver to</dt>
              <dd className="font-medium text-ink">
                {draft.name} · {formatPhoneKE(draft.phone)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Location</dt>
              <dd className="font-medium text-ink">
                {draft.deliveryMethod === "pickup"
                  ? STORE_ADDRESS
                  : `${draft.address ? draft.address + ", " : ""}${draft.town}, ${draft.county}`}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Estimated</dt>
              <dd className="font-medium text-ink">
                {deliveryEtaFor(draft.deliveryMethod)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <AnimatedLinkButton href="/track" variant="primary">
              <MessageCircle className="h-4 w-4" /> Track this order
            </AnimatedLinkButton>
            <AnimatedLinkButton href="/products" variant="secondary">
              Continue Shopping
            </AnimatedLinkButton>
          </div>
          <p className="mt-3 text-xs text-muted">
            Keep your reference <b>{orderRef}</b>. You can also{" "}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(trackMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand hover:underline"
            >
              ask for an update on WhatsApp
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  /* ---- Empty cart ---- */
  if (lines.length === 0) {
    return (
      <div className="section flex max-w-lg flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-ink">Your cart is empty</h1>
        <p className="text-sm text-muted">Add a product before checking out.</p>
        <AnimatedLinkButton href="/products" variant="dark" className="mt-2">
          Browse Products
        </AnimatedLinkButton>
      </div>
    );
  }

  /* ---- Stepper ---- */
  return (
    <div className="section py-8 sm:py-12">
      <Link
        href="/cart"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Checkout
      </h1>

      <div className="mt-6 max-w-2xl">
        <CheckoutSteps current={step} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {step === 0 && (
            <Section title="Your details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow className="sm:col-span-2" label="Full name" error={errors.name}>
                  <input
                    className="field"
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Jane Wanjiru"
                    autoComplete="name"
                  />
                </FieldRow>
                <FieldRow label="Phone number" error={errors.phone}>
                  <input
                    className="field"
                    inputMode="tel"
                    value={draft.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="0712 345 678"
                    autoComplete="tel"
                  />
                </FieldRow>
                <FieldRow label="Email (optional)" error={errors.email}>
                  <input
                    className="field"
                    type="email"
                    value={draft.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </FieldRow>
                <FieldRow label="County" error={errors.county}>
                  <select
                    className="field"
                    value={draft.county}
                    onChange={(e) => set("county", e.target.value)}
                  >
                    <option value="">Select county…</option>
                    {counties.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </FieldRow>
                <FieldRow label="Town / area" error={errors.town}>
                  <input
                    className="field"
                    value={draft.town}
                    onChange={(e) => set("town", e.target.value)}
                    placeholder="e.g. Westlands"
                  />
                </FieldRow>
                <FieldRow
                  className="sm:col-span-2"
                  label="Delivery address (building, street, landmark)"
                  error={errors.address}
                  hint="Needed for courier delivery"
                >
                  <textarea
                    className="field"
                    rows={2}
                    value={draft.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </FieldRow>
                <FieldRow className="sm:col-span-2" label="Order notes (optional)">
                  <textarea
                    className="field"
                    rows={2}
                    value={draft.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </FieldRow>
              </div>
            </Section>
          )}

          {step === 1 && (
            <Section title="Delivery method">
              <div className="flex flex-col gap-3">
                {deliveryOptions.map((opt) => {
                  const active = draft.deliveryMethod === opt.method;
                  const fee = opt.fee(draft.county || null);
                  return (
                    <label
                      key={opt.method}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                        active
                          ? "border-brand bg-brand-050"
                          : "border-border hover:border-brand/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        className="mt-1 h-4 w-4 text-brand focus:ring-brand"
                        checked={active}
                        onChange={() => set("deliveryMethod", opt.method)}
                      />
                      <span className="flex-1">
                        <span className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-ink">
                            {opt.label}
                          </span>
                          <span className="text-sm font-semibold text-ink">
                            {fee === 0 ? "Free" : formatKES(fee)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {opt.description} · {opt.eta}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5" /> Pickup point: {STORE_ADDRESS}
              </p>
            </Section>
          )}

          {step === 2 && (
            <Section title="Payment method">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {paymentMethods.map((m) => {
                  const active = draft.payment === m.value;
                  return (
                    <label
                      key={m.value}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition-colors ${
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-border text-ink/70 hover:border-brand/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.value}
                        checked={active}
                        onChange={() => set("payment", m.value)}
                        className="sr-only"
                      />
                      <span className="block text-sm font-semibold">{m.label}</span>
                      <span
                        className={`mt-0.5 block text-[11px] ${
                          active ? "text-white/80" : "text-muted"
                        }`}
                      >
                        {m.hint}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4">
                {draft.payment === "mpesa" && (
                  <>
                    <MpesaInstructions amount={total} />
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FieldRow label="M-Pesa confirmation code (optional)">
                        <input
                          className="field uppercase"
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value)}
                          placeholder="e.g. SGH7X2K9QP"
                        />
                      </FieldRow>
                      <FieldRow label="Name on M-Pesa (optional)">
                        <input
                          className="field"
                          value={draft.mpesaName}
                          onChange={(e) => set("mpesaName", e.target.value)}
                          placeholder="If different from above"
                        />
                      </FieldRow>
                    </div>
                  </>
                )}
                {draft.payment === "cod" && (
                  <p className="rounded-xl border border-border bg-surface-muted/50 p-4 text-sm text-muted">
                    Pay cash to the rider when your order arrives. Available for
                    courier delivery only — please have the exact amount ready.
                  </p>
                )}
                {draft.payment === "bank" && (
                  <p className="rounded-xl border border-border bg-surface-muted/50 p-4 text-sm text-muted">
                    Choose this and place your order — we&apos;ll send our bank
                    account details on WhatsApp to complete the transfer.
                  </p>
                )}
              </div>
            </Section>
          )}

          {step === 3 && (
            <Section title="Review & place order">
              <ReviewRow
                label="Contact"
                onEdit={() => setStep(0)}
                value={
                  <>
                    {draft.name} · {formatPhoneKE(draft.phone)}
                    {draft.email && ` · ${draft.email}`}
                  </>
                }
              />
              <ReviewRow
                label="Deliver to"
                onEdit={() => setStep(0)}
                value={
                  draft.deliveryMethod === "pickup"
                    ? `Pickup — ${STORE_ADDRESS}`
                    : `${draft.address ? draft.address + ", " : ""}${draft.town}, ${draft.county}`
                }
              />
              <ReviewRow
                label="Delivery"
                onEdit={() => setStep(1)}
                value={`${
                  deliveryOptions.find((o) => o.method === draft.deliveryMethod)?.label
                } · ${deliveryFee === 0 ? "Free" : formatKES(deliveryFee)} · ${deliveryEtaFor(
                  draft.deliveryMethod
                )}`}
              />
              <ReviewRow
                label="Payment"
                onEdit={() => setStep(2)}
                value={
                  <>
                    {paymentMethods.find((p) => p.value === draft.payment)?.label}
                    {draft.payment === "mpesa" &&
                      ` · Send Money to ${MPESA_PAYBILL_NUMBER}`}
                    {draft.payment === "mpesa" && mpesaCode && ` · ${mpesaCode.toUpperCase()}`}
                  </>
                }
              />
              {draft.notes && (
                <ReviewRow
                  label="Notes"
                  onEdit={() => setStep(0)}
                  value={draft.notes}
                />
              )}

              <p className="mt-4 text-xs text-muted">
                Placing the order opens WhatsApp with these details so our team can
                confirm your payment and delivery. Nothing is charged automatically.
              </p>
            </Section>
          )}

          {/* Step nav */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button onClick={back} className="btn-ghost">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <AnimatedButton onClick={next} variant="primary">
                Continue <ArrowRight className="h-4 w-4" />
              </AnimatedButton>
            ) : (
              <AnimatedButton
                onClick={handlePlace}
                variant="primary"
                isLoading={submitting}
              >
                <MessageCircle className="h-4 w-4" />
                {submitting ? "Placing order…" : "Place Order"}
              </AnimatedButton>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Order Summary</h2>
              <Link
                href="/cart"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-strong"
              >
                <Pencil className="h-3 w-3" /> Edit
              </Link>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {lines.map((l) => (
                <div key={l.sku} className="flex justify-between gap-2">
                  <span className="text-ink/80">
                    {l.name} <span className="text-muted">×{l.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium text-ink">
                    {l.price === null ? "POA" : formatKES(l.price * l.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium text-ink">{formatKES(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">
                  Delivery{draft.county ? ` · ${draft.county}` : ""}
                </dt>
                <dd className="font-medium text-ink">
                  {step === 0
                    ? "Next step"
                    : deliveryFee === 0
                      ? "Free"
                      : formatKES(deliveryFee)}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-ink">
              <span>Total</span>
              <span>{formatKES(step === 0 ? subtotal : total)}</span>
            </div>

            <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Secure checkout ·
                pay with M-Pesa
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-success" /> Countrywide delivery,
                clear fees
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-success" /> 7-day returns &amp;
                warranty
              </li>
              <li className="flex items-center gap-2">
                <Headphones className="h-3.5 w-3.5 text-success" /> WhatsApp support &amp;
                order tracking
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-ink">{title}</h2>
      {children}
    </div>
  );
}

function FieldRow({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-ink/70">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 first:pt-0 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-ink">{value}</p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 text-xs font-semibold text-brand hover:text-brand-strong"
      >
        Edit
      </button>
    </div>
  );
}
