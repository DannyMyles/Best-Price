"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useProducts } from "@/hooks/useProducts";
import { ProductImage } from "@/components/ui/ProductImage";

export function CompareBar() {
  const { skus, remove, clear, count } = useCompare();
  const { products } = useProducts();

  const items = skus
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-16 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-3xl items-center gap-3 rounded-2xl border border-border bg-surface/95 p-2.5 pl-3 shadow-xl backdrop-blur lg:bottom-5"
        >
          <span className="hidden shrink-0 text-xs font-semibold text-muted sm:block">
            Compare
          </span>
          <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
            {items.map((p) => (
              <div
                key={p.sku}
                className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border"
              >
                <ProductImage
                  src={p.images?.[0]}
                  category={p.category}
                  alt={p.name}
                  className="h-full w-full"
                  iconClassName="h-4 w-4"
                  sizes="44px"
                />
                <button
                  onClick={() => remove(p.sku)}
                  aria-label={`Remove ${p.name}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
              <div
                key={`ph-${i}`}
                className="h-11 w-11 shrink-0 rounded-lg border border-dashed border-border-strong"
              />
            ))}
          </div>
          <button
            onClick={clear}
            className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-muted hover:text-ink"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            <GitCompareArrows className="h-4 w-4" />
            Compare ({count})
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
