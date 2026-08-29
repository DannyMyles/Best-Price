"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";
import { TiltCard } from "@/components/ui/TiltCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatKES, discountPercent } from "@/lib/format";

export function SpotlightTile({ product }: { product: Product | null }) {
  const off = product
    ? discountPercent(product.price, product.compareAtPrice)
    : null;

  return (
    <div className="group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl bg-panel-dark p-6 text-white">
      <div
        aria-hidden
        className="aurora-a pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/30 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
      />
      <div
        aria-hidden
        className="aurora-b pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-2">
        <Sparkles className="h-3.5 w-3.5" /> Spotlight
      </div>

      {product ? (
        <>
          <div className="relative z-10 my-auto flex items-center justify-center py-4">
            <TiltCard maxTilt={12} className="w-full max-w-[15rem]">
              <ProductImage
                src={product.images?.[0]}
                category={product.category}
                alt={product.name}
                priority
                className="aspect-square w-full rounded-2xl shadow-2xl"
                iconClassName="h-20 w-20"
                sizes="(min-width: 1024px) 22vw, 70vw"
              />
            </TiltCard>
          </div>

          <div className="relative z-10">
            <p className="text-[11px] uppercase tracking-wide text-white/50">
              {product.category.replace(/-/g, " ")}
            </p>
            <h3 className="mt-1 line-clamp-1 text-lg font-semibold">
              {product.name}
            </h3>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                  {formatKES(product.price)}
                </span>
                {off !== null && (
                  <>
                    <span className="text-xs text-white/50 line-through">
                      {formatKES(product.compareAtPrice!)}
                    </span>
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                      −{off}%
                    </span>
                  </>
                )}
              </span>
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-panel-dark transition-transform hover:translate-x-0.5"
              >
                Buy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="relative z-10 my-auto flex flex-col items-center gap-3">
          <Skeleton className="h-40 w-40 rounded-2xl opacity-20" />
          <Skeleton className="h-4 w-32 opacity-20" />
        </div>
      )}
    </div>
  );
}
