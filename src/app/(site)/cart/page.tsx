"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatKES } from "@/lib/format";
import { CartItem } from "@/components/cart/CartItem";
import { ProductImage } from "@/components/ui/ProductImage";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";

const trust = [
  { icon: ShieldCheck, label: "Secure M-Pesa payment" },
  { icon: Truck, label: "Countrywide delivery" },
  { icon: RotateCcw, label: "7-day returns" },
];

export default function CartPage() {
  const { lines, saved, subtotal, hasPOAItems, clearCart, moveToCart, removeSaved } =
    useCart();

  if (lines.length === 0 && saved.length === 0) {
    return (
      <div className="section flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
          <ShoppingBag className="h-9 w-9 text-muted" />
        </div>
        <h1 className="text-xl font-semibold text-ink">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted">
          Explore our products and find something you love. Everything ships
          countrywide with secure M-Pesa payment.
        </p>
        <AnimatedLinkButton href="/products" variant="dark" className="mt-2">
          Start Shopping
        </AnimatedLinkButton>
      </div>
    );
  }

  return (
    <div className="section py-8 sm:py-12">
      <Link
        href="/products"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Shopping Cart
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          {lines.length > 0 ? (
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-5">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <CartItem key={line.sku} line={line} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
              Your cart is empty — move a saved item back to get started.
            </div>
          )}

          {lines.length > 0 && (
            <button
              onClick={clearCart}
              className="mt-3 text-sm font-medium text-muted hover:text-danger"
            >
              Clear cart
            </button>
          )}

          {saved.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 text-base font-semibold text-ink">
                Saved for later ({saved.length})
              </h2>
              <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
                {saved.map((line) => (
                  <div key={line.sku} className="flex items-center gap-3 p-4">
                    <Link
                      href={`/products/${line.slug}`}
                      className="shrink-0 overflow-hidden rounded-lg"
                    >
                      <ProductImage
                        src={line.image}
                        category={line.category ?? "accessories"}
                        alt={line.name}
                        className="h-14 w-14 rounded-lg"
                        iconClassName="h-6 w-6"
                        sizes="56px"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${line.slug}`}
                        className="line-clamp-1 text-sm font-medium text-ink hover:underline"
                      >
                        {line.name}
                      </Link>
                      <p className="text-xs text-muted">
                        {line.price === null ? "Price on request" : formatKES(line.price)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => moveToCart(line.sku)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand"
                      >
                        Move to cart
                      </button>
                      <button
                        onClick={() => removeSaved(line.sku)}
                        className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-fit lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-semibold text-ink">Order Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">
                  Subtotal ({lines.reduce((n, l) => n + l.quantity, 0)} items)
                </dt>
                <dd className="font-medium text-ink">{formatKES(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-medium text-ink">Free pickup · courier from KES 250</dd>
              </div>
            </dl>
            {hasPOAItems && (
              <p className="mt-3 rounded-lg bg-surface-muted p-3 text-xs text-muted">
                Some items need a custom quote — we&apos;ll confirm the final price
                before you pay.
              </p>
            )}
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatKES(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Delivery calculated at checkout — no surprise fees.
            </p>
            <AnimatedLinkButton
              href="/checkout"
              variant="primary"
              className="mt-5 w-full"
            >
              Proceed to Checkout
            </AnimatedLinkButton>

            <ul className="mt-5 space-y-2 border-t border-border pt-4">
              {trust.map((t) => (
                <li
                  key={t.label}
                  className="flex items-center gap-2 text-xs text-muted"
                >
                  <t.icon className="h-3.5 w-3.5 text-success" /> {t.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
