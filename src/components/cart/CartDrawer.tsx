"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatKES } from "@/lib/format";
import { CartItem } from "./CartItem";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";

export function CartDrawer() {
  const { lines, isOpen, closeCart, subtotal, hasPOAItems, itemCount } = useCart();
  const reduced = useReducedMotion();
  const ref = useFocusTrap<HTMLDivElement>(isOpen, closeCart);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-md flex-col bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-ink">
                Your Cart{itemCount > 0 && ` (${itemCount})`}
              </h2>
              <button
                aria-label="Close cart"
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-surface-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
                  <ShoppingBag className="h-7 w-7 text-muted" />
                </div>
                <p className="text-sm font-medium text-ink">Your cart is empty</p>
                <p className="text-sm text-muted">
                  Browse our products and add something you love.
                </p>
                <AnimatedLinkButton
                  variant="dark"
                  href="/products"
                  onClick={closeCart}
                  className="mt-2"
                >
                  Start Shopping
                </AnimatedLinkButton>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-border overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <CartItem key={line.sku} line={line} compact />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t border-border px-5 py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-semibold text-ink">
                      {formatKES(subtotal)}
                    </span>
                  </div>
                  {hasPOAItems && (
                    <p className="mt-1.5 text-xs text-muted">
                      Some items need a quote — confirmed before you pay.
                    </p>
                  )}
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    Secure M-Pesa checkout · delivery calculated next
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <AnimatedLinkButton
                      variant="primary"
                      href="/checkout"
                      onClick={closeCart}
                      className="w-full"
                    >
                      Checkout · {formatKES(subtotal)}
                    </AnimatedLinkButton>
                    <AnimatedLinkButton
                      variant="secondary"
                      href="/cart"
                      onClick={closeCart}
                      className="w-full"
                    >
                      View full cart
                    </AnimatedLinkButton>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
