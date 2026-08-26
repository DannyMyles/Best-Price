"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatKES } from "@/lib/format";
import { CartItem } from "@/components/cart/CartItem";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";

export default function CartPage() {
  const { lines, subtotal, hasPOAItems, clearCart } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
          <ShoppingBag className="h-9 w-9 text-muted" />
        </div>
        <h1 className="text-xl font-semibold text-ink">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted">
          Looks like you haven&apos;t added anything yet. Explore our products and
          find something you love.
        </p>
        <AnimatedLinkButton href="/products" variant="dark" className="mt-2">
          Start Shopping
        </AnimatedLinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Shopping Cart
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-5">
            {lines.map((line) => (
              <CartItem key={line.sku} line={line} />
            ))}
          </div>
          <button
            onClick={clearCart}
            className="mt-4 text-sm font-medium text-muted hover:text-red-500"
          >
            Clear cart
          </button>
        </div>

        <div className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold text-ink">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium text-ink">{formatKES(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Delivery</span>
            <span className="font-medium text-ink">Calculated at checkout</span>
          </div>
          {hasPOAItems && (
            <p className="mt-3 rounded-lg bg-surface-muted p-3 text-xs text-muted">
              Some items require a custom quote. We&apos;ll confirm final pricing via
              WhatsApp before you pay.
            </p>
          )}
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatKES(subtotal)}</span>
          </div>
          <AnimatedLinkButton
            href="/checkout"
            variant="primary"
            className="mt-6 w-full"
          >
            Proceed to Checkout
          </AnimatedLinkButton>
        </div>
      </div>
    </div>
  );
}
