"use client";

import Link from "next/link";
import { ArrowRight, Clock, Flame } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCountdownToMidnight } from "@/hooks/useCountdown";
import { formatKES, discountPercent } from "@/lib/format";

export function DealTile({ product }: { product: Product | null }) {
  const t = useCountdownToMidnight();
  const off = product
    ? discountPercent(product.price, product.compareAtPrice)
    : null;
  const isRealDeal = off !== null;

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-accent/25 bg-accent-050/60 p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
          <Flame className="h-3.5 w-3.5" />
          {isRealDeal ? "Deal of the day" : "Today's pick"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[11px] font-bold tabular-nums text-ink shadow-sm">
          <Clock className="h-3 w-3 text-accent" />
          {t.hours}:{t.minutes}:{t.seconds}
        </span>
      </div>

      {product ? (
        <div className="my-3 flex items-center gap-4">
          <ProductImage
            src={product.images?.[0]}
            category={product.category}
            alt={product.name}
            className="h-20 w-20 shrink-0 rounded-2xl"
            iconClassName="h-8 w-8"
            sizes="80px"
          />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-ink">
              {product.name}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-base font-bold text-ink">
                {formatKES(product.price)}
              </span>
              {isRealDeal && (
                <>
                  <span className="text-xs text-muted line-through">
                    {formatKES(product.compareAtPrice!)}
                  </span>
                  <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                    −{off}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="my-3 flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}

      <Link
        href={product ? `/products/${product.slug}` : "/products"}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
      >
        {isRealDeal ? "Grab this deal" : "Shop this pick"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
