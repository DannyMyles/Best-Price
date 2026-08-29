"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import {
  selectBestSellers,
  selectNewArrivals,
  selectDeals,
} from "@/services/productService";
import { ProductRail } from "@/components/product/ProductRail";
import { QuickViewModal } from "@/components/product/QuickViewModal";

export function HomeRails() {
  const { products, loading } = useProducts();
  const [quickView, setQuickView] = useState<Product | null>(null);

  const bestSellers = useMemo(() => selectBestSellers(products), [products]);
  const deals = useMemo(() => selectDeals(products), [products]);
  const newArrivals = useMemo(() => {
    const shown = new Set(bestSellers.slice(0, 8).map((p) => p.sku));
    const all = selectNewArrivals(products);
    const fresh = all.filter((p) => !shown.has(p.sku));
    return fresh.length >= 4 ? fresh : all;
  }, [products, bestSellers]);

  return (
    <>
      {deals.length > 0 && (
        <div className="border-y border-accent/20 bg-accent-050/50">
          <ProductRail
            eyebrow="Save now"
            title="Today's Deals"
            description="Genuine price drops while stock lasts"
            viewAllHref="/products"
            products={deals}
            loading={false}
            onQuickView={setQuickView}
          />
        </div>
      )}

      <ProductRail
        eyebrow="Trending now"
        title="Popular right now"
        description="What Kenyan shoppers are buying most"
        viewAllHref="/products"
        products={bestSellers}
        loading={loading}
        onQuickView={setQuickView}
      />

      <ProductRail
        eyebrow="Fresh in"
        title="New Arrivals"
        description="The latest devices to land in store"
        viewAllHref="/products"
        products={newArrivals}
        loading={loading}
        onQuickView={setQuickView}
      />

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
