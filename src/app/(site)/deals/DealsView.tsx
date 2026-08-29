"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import { useMounted } from "@/hooks/useMounted";
import { isDeal } from "@/services/productService";
import { discountPercent } from "@/lib/format";
import { ProductGrid } from "@/components/product/ProductGrid";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { ErrorState } from "@/components/ui/ErrorState";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";

export function DealsView() {
  const { products: all, loading: rawLoading, error, retry } = useProducts();
  const mounted = useMounted();
  const loading = !mounted || rawLoading;

  const [quickView, setQuickView] = useState<Product | null>(null);

  const deals = useMemo(() => {
    return all
      .filter(isDeal)
      .slice()
      .sort(
        (a, b) =>
          (discountPercent(b.price, b.compareAtPrice) ?? 0) -
          (discountPercent(a.price, a.compareAtPrice) ?? 0)
      );
  }, [all]);

  const maxOff = deals.reduce(
    (m, p) => Math.max(m, discountPercent(p.price, p.compareAtPrice) ?? 0),
    0
  );

  return (
    <div className="section py-8 sm:py-12">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Save now
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Deals &amp; Clearance
        </h1>
        <p className="mt-1.5 text-sm text-muted" aria-live="polite">
          {loading
            ? "Loading deals…"
            : deals.length === 0
              ? "No active deals right now — check back soon."
              : `${deals.length} ${deals.length === 1 ? "deal" : "deals"}${
                  maxOff > 0 ? ` · save up to ${maxOff}%` : ""
                }`}
        </p>
      </div>

      {error ? (
        <ErrorState onRetry={retry} />
      ) : !loading && deals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
          <p className="text-sm font-medium text-ink">Nothing on offer today</p>
          <p className="max-w-xs text-sm text-muted">
            New deals and clearance stock land regularly. Browse the full range
            in the meantime.
          </p>
          <AnimatedLinkButton href="/products" variant="dark" className="mt-1">
            Shop all products
          </AnimatedLinkButton>
        </div>
      ) : (
        <ProductGrid
          products={loading ? [] : deals}
          loading={loading}
          onQuickView={setQuickView}
        />
      )}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}
