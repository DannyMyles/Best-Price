"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ProductRail({
  eyebrow,
  title,
  description,
  viewAllHref,
  products,
  loading = false,
  onQuickView,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  viewAllHref?: string;
  products: Product[];
  loading?: boolean;
  onQuickView?: (product: Product) => void;
}) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="section py-10 sm:py-14">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        viewAll={viewAllHref ? { href: viewAllHref } : undefined}
      />

      {/* Mobile: horizontal snap carousel. Desktop: grid. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {(loading ? Array.from({ length: 4 }) : products.slice(0, 8)).map((p, i) =>
          loading ? (
            <div key={i} className="w-[46%] shrink-0 snap-start sm:w-auto">
              <ProductCardSkeleton />
            </div>
          ) : (
            <div
              key={(p as Product).sku}
              className="w-[46%] shrink-0 snap-start sm:w-auto"
            >
              <ProductCard product={p as Product} onQuickView={onQuickView} />
            </div>
          )
        )}
      </div>

      {viewAllHref && (
        <div className="mt-6 flex justify-center sm:hidden">
          <a
            href={viewAllHref}
            className="text-sm font-semibold text-brand"
          >
            View all →
          </a>
        </div>
      )}
    </section>
  );
}
