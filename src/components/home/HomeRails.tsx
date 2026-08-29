"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useProducts } from "@/hooks/useProducts";
import { readViewed } from "@/hooks/useRecentlyViewed";
import {
  selectBestSellers,
  selectNewArrivals,
  selectDeals,
  selectRecommended,
} from "@/services/productService";
import { ProductRail } from "@/components/product/ProductRail";
import { QuickViewModal } from "@/components/product/QuickViewModal";

export function HomeRails() {
  const { products, loading } = useProducts();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [recentCats, setRecentCats] = useState<string[]>([]);

  useEffect(() => {
    const slugs = readViewed();
    const cats = slugs
      .map((s) => products.find((p) => p.slug === s)?.category)
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map(String);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentCats([...new Set(cats)]);
  }, [products]);

  const bestSellers = useMemo(() => selectBestSellers(products), [products]);
  const newArrivals = useMemo(() => selectNewArrivals(products), [products]);
  const deals = useMemo(() => selectDeals(products), [products]);
  const recommended = useMemo(
    () => selectRecommended(products, recentCats),
    [products, recentCats]
  );

  return (
    <>
      <ProductRail
        eyebrow="Trending now"
        title="Popular & Best Sellers"
        description="What Kenyan shoppers are buying most"
        viewAllHref="/products"
        products={bestSellers}
        loading={loading}
        onQuickView={setQuickView}
      />

      {deals.length > 0 && (
        <div className="bg-accent-050/50">
          <ProductRail
            eyebrow="Limited-time"
            title="Special Offers"
            description="Genuine price drops while stock lasts"
            viewAllHref="/products"
            products={deals}
            loading={false}
            onQuickView={setQuickView}
          />
        </div>
      )}

      <ProductRail
        eyebrow="Fresh in"
        title="New Arrivals"
        description="The latest devices to land in store"
        viewAllHref="/products"
        products={newArrivals}
        loading={loading}
        onQuickView={setQuickView}
      />

      {recentCats.length > 0 && (
        <ProductRail
          eyebrow="For you"
          title="Recommended"
          description="Based on what you've been viewing"
          viewAllHref="/products"
          products={recommended}
          loading={loading}
          onQuickView={setQuickView}
        />
      )}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
