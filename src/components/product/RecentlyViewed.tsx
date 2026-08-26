"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { recordView, readViewed } from "@/hooks/useRecentlyViewed";
import { ProductCard } from "./ProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const { products } = useProducts();
  const [viewedSlugs, setViewedSlugs] = useState<string[]>([]);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can only run after mount.
    recordView(currentSlug);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewedSlugs(readViewed());
  }, [currentSlug]);

  const items = viewedSlugs
    .filter((slug) => slug !== currentSlug)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-semibold tracking-tight text-ink">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
}
