"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import { useMounted } from "@/hooks/useMounted";
import { selectBestSellers } from "@/services/productService";
import { ProductImage } from "@/components/ui/ProductImage";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatKES } from "@/lib/format";

/** Apple-Store-style editorial tiles: a few standout products on large,
 *  calm panels with text on top and the product image below. */
export function FeatureTiles() {
  const { products } = useProducts();
  const mounted = useMounted();

  const picks = useMemo(() => {
    if (!mounted) return [];
    return selectBestSellers(products)
      .filter((p) => (p.images?.length ?? 0) > 0 && p.price !== null)
      .slice(0, 3);
  }, [products, mounted]);

  const tiles: (Product | null)[] =
    mounted && picks.length > 0 ? picks : [null, null, null];

  return (
    <section className="section py-12 sm:py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          The latest.
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Take a look at what&apos;s new and in demand right now.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {tiles.map((p, i) => (
          <FeatureTile key={p?.slug ?? i} product={p} />
        ))}
      </div>
    </section>
  );
}

function FeatureTile({ product }: { product: Product | null }) {
  if (!product) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface-muted p-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-4 h-48 w-48 rounded-2xl" />
      </div>
    );
  }

  const eyebrow =
    product.badge ??
    (product.compareAtPrice &&
    product.price &&
    product.compareAtPrice > product.price
      ? "Sale"
      : "Featured");

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col items-center rounded-3xl bg-surface-muted p-8 text-center transition-colors hover:bg-brand-050"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
        {eyebrow}
      </p>
      <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
        {product.name}
      </h3>
      <p className="mt-1 text-sm text-muted">From {formatKES(product.price)}</p>
      <span className="mt-3 inline-flex items-center gap-4 text-sm font-semibold">
        <span className="text-brand group-hover:underline">Buy</span>
        <span className="text-ink/70">Learn more ›</span>
      </span>
      <div className="mt-6 w-full">
        <ProductImage
          src={product.images?.[0]}
          category={product.category}
          alt={product.name}
          className="mx-auto aspect-square w-full max-w-xs rounded-2xl transition-transform duration-300 group-hover:scale-[1.03]"
          iconClassName="h-16 w-16"
          sizes="(min-width: 1024px) 30vw, 90vw"
        />
      </div>
    </Link>
  );
}
