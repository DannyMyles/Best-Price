"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ProductImage } from "@/components/ui/ProductImage";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { StockPill } from "@/components/ui/StockPill";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { isOutOfStock } from "@/lib/badges";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const open = product !== null;
  const reduced = useReducedMotion();
  const trapRef = useFocusTrap<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-surface shadow-xl sm:rounded-3xl"
          >
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink/60 shadow-sm hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 sm:p-6">
              <div className="overflow-hidden rounded-2xl bg-surface-muted">
                <ProductImage
                  src={product.images?.[0]}
                  category={product.category}
                  alt={product.name}
                  className="aspect-square w-full"
                  iconClassName="h-24 w-24"
                  sizes="(min-width: 640px) 40vw, 90vw"
                />
              </div>

              <QuickViewBody product={product} onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QuickViewBody({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const { push } = useToast();
  const [qty, setQty] = useState(1);
  const soldOut = isOutOfStock(product);

  function add() {
    addItem(product, qty);
    push({
      type: "success",
      message: `${product.name} added to cart`,
      action: { label: "View cart", href: "/cart" },
    });
    onClose();
  }

  return (
    <div className="flex flex-col">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {product.category.replace(/-/g, " ")}
      </p>
      <h2 className="mt-1 text-lg font-bold text-ink">{product.name}</h2>
      {product.rating != null && (
        <Rating
          value={product.rating}
          count={product.reviewCount}
          className="mt-2"
        />
      )}
      <div className="mt-3">
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="lg"
        />
      </div>
      <div className="mt-2">
        <StockPill product={product} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
        {product.description}
      </p>

      {!soldOut && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-medium text-ink/70">Qty</span>
          <div className="flex items-center rounded-full border border-border">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center text-ink/60 hover:text-ink"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center text-ink/60 hover:text-ink"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2">
        {!soldOut && (
          <AnimatedButton variant="primary" onClick={add} className="w-full">
            Add to Cart
          </AnimatedButton>
        )}
        <Link
          href={`/products/${product.slug}`}
          onClick={onClose}
          className="btn-secondary w-full"
        >
          Full details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
