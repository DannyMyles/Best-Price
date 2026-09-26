"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import { useCutout } from "@/hooks/useCutout";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatKES } from "@/lib/format";
import { cn } from "@/lib/cn";

/** "Flagship picks": the top in-stock product from three different
 *  departments, on dark panels in the same style as the homepage hero
 *  (product photo with its white background removed, floating on dark). */
export function FeatureTiles() {
  const { products, loading } = useProducts();
  const { categories } = useCategories();

  const picks = useMemo(() => {
    const best = new Map<string, Product>();
    for (const p of products) {
      if (p.price === null || !p.inStock || !(p.images?.length ?? 0)) continue;
      const current = best.get(p.category);
      if (!current || (p.price ?? 0) > (current.price ?? 0)) best.set(p.category, p);
    }
    return [...best.values()].sort((a, b) => (b.price ?? 0) - (a.price ?? 0)).slice(0, 3);
  }, [products]);

  if (!loading && picks.length < 3) return null;
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <section className="bg-panel-dark text-white">
      <div className="section py-14 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">Flagship picks</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">The best of each department.</h2>
            <p className="mt-1.5 text-sm text-white/60">Top-of-the-range gear, genuine and in stock now.</p>
          </div>
          <Link
            href="/products?sort=price-desc"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            Shop premium <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {picks.length === 3
            ? picks.map((p) => <FlagshipTile key={p.sku} product={p} category={categoryName(p.category)} />)
            : [0, 1, 2].map((i) => (
                <div key={i} className="flex h-100 flex-col gap-3 rounded-[12px] bg-white/4 p-6">
                  <Skeleton className="h-3 w-20 bg-white/10" />
                  <Skeleton className="h-6 w-48 bg-white/10" />
                  <Skeleton className="mx-auto mt-auto h-44 w-44 rounded-full bg-white/10" />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

function FlagshipTile({ product, category }: { product: Product; category: string }) {
  const shot = useCutout(product.images?.[0]);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex h-100 flex-col overflow-hidden rounded-[12px] border border-white/8 bg-[radial-gradient(ellipse_at_50%_85%,rgba(31,163,92,0.22),transparent_60%),linear-gradient(160deg,#16191e,#0d0f12)] p-6 transition-colors hover:border-white/20"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">{category}</p>
      <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug tracking-tight">{product.name}</h3>
      <p className="mt-1.5 text-sm text-white/60">
        <span className="font-semibold text-white">{formatKES(product.price)}</span>
      </p>

      <div className="relative mt-4 min-h-0 flex-1">
        {shot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shot.url}
            alt={product.name}
            loading="lazy"
            className={cn(
              "absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]",
              shot.cutout ? "drop-shadow-[0_20px_24px_rgba(0,0,0,0.55)]" : "rounded-[8px]"
            )}
          />
        )}
      </div>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-transform group-hover:translate-x-1">
        Shop now <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
