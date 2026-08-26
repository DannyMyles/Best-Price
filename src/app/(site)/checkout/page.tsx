"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatKES } from "@/lib/format";
import { AnimatedButton, AnimatedLinkButton } from "@/components/ui/AnimatedButton";
import { WHATSAPP_NUMBER } from "@/components/layout/WhatsAppButton";
import { placeOrder } from "@/services/orderService";

const paymentMethods = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "cod", label: "Cash on Delivery" },
  { value: "bank", label: "Bank Transfer" },
] as const;

export default function CheckoutPage() {
  const { lines, subtotal, hasPOAItems, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<(typeof paymentMethods)[number]["value"]>(
    "mpesa"
  );
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function buildMessage() {
    const itemLines = lines
      .map(
        (l) =>
          `• ${l.name}${l.color ? ` (${l.color})` : ""} x${l.quantity} — ${
            l.price === null ? "POA" : formatKES(l.price * l.quantity)
          }`
      )
      .join("\n");

    return [
      "New order from BestPrice Technologies website:",
      "",
      itemLines,
      "",
      `Subtotal: ${formatKES(subtotal)}${hasPOAItems ? " (+ items on request)" : ""}`,
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Delivery address: ${address}`,
      `Payment method: ${paymentMethods.find((p) => p.value === payment)?.label}`,
      notes ? `Notes: ${notes}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0 || !name.trim() || !phone.trim() || !address.trim()) return;

    setSubmitting(true);
    await placeOrder({
      customer: { name: name.trim(), phone: phone.trim(), address: address.trim() },
      items: lines.map((l) => ({
        sku: l.sku,
        name: l.name,
        slug: l.slug,
        price: l.price,
        color: l.color,
        quantity: l.quantity,
      })),
      subtotal,
      paymentMethod: payment,
      notes: notes.trim() || undefined,
    });

    const message = buildMessage();
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    setSubmitting(false);
    setPlaced(true);
    clearCart();
  }

  if (placed) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-xl font-semibold text-ink">Order sent!</h1>
        <p className="text-sm text-muted">
          We&apos;ve opened WhatsApp with your order details. Send the message to
          confirm — our team will get back to you shortly to arrange payment and
          delivery.
        </p>
        <AnimatedLinkButton href="/products" variant="dark" className="mt-2">
          Continue Shopping
        </AnimatedLinkButton>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-ink">Your cart is empty</h1>
        <p className="text-sm text-muted">Add a product before checking out.</p>
        <AnimatedLinkButton href="/products" variant="dark" className="mt-2">
          Browse Products
        </AnimatedLinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">Your Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink/70">
                  Full name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted/50 px-4 py-2.5 text-sm outline-none focus:border-brand/50"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink/70">
                  Phone number
                </label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-muted/50 px-4 py-2.5 text-sm outline-none focus:border-brand/50"
                  placeholder="07XX XXX XXX"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink/70">
                  Delivery address
                </label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface-muted/50 px-4 py-2.5 text-sm outline-none focus:border-brand/50"
                  placeholder="Area, building, town"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink/70">
                  Order notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-surface-muted/50 px-4 py-2.5 text-sm outline-none focus:border-brand/50"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">Payment Method</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    payment === method.value
                      ? "border-brand bg-brand text-white"
                      : "border-border text-ink/70 hover:border-brand/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={payment === method.value}
                    onChange={() => setPayment(method.value)}
                    className="sr-only"
                  />
                  {method.label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Payment is confirmed directly with our team on WhatsApp after you place
              your order.
            </p>
          </div>

          <AnimatedButton
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full disabled:opacity-60 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" />
            {submitting ? "Placing order…" : "Place Order via WhatsApp"}
          </AnimatedButton>
        </form>

        <div className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold text-ink">Order Summary</h2>
          <div className="mt-4 flex flex-col gap-3">
            {lines.map((l) => (
              <div key={l.sku} className="flex justify-between text-sm">
                <span className="text-ink/80">
                  {l.name} <span className="text-muted">x{l.quantity}</span>
                </span>
                <span className="font-medium text-ink">
                  {l.price === null ? "POA" : formatKES(l.price * l.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatKES(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
