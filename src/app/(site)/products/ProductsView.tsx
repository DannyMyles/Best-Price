"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { filterAndSortProducts } from "@/services/productService";
import { getCategory } from "@/lib/data/categories";
import { SearchBar } from "@/components/product/SearchBar";
import { FilterPanel, SortOption } from "@/components/product/FilterPanel";
import { ProductGrid } from "@/components/product/ProductGrid";

export function ProductsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, loading } = useProducts();

  const category = searchParams.get("category");
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  // Re-sync the search box when navigation (e.g. the navbar search) changes
  // ?q= on this same route — the React-recommended alternative to an effect
  // for "adjust state when a prop changes".
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  const [sort, setSort] = useState<SortOption>("featured");

  function updateCategory(slug: string | null) {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (query.trim()) params.set("q", query.trim());
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }

  const filtered = useMemo(
    () => filterAndSortProducts(products, { category, query, sort }),
    [products, category, query, sort]
  );

  const activeCategoryName = category ? getCategory(category)?.name : null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {activeCategoryName ?? "All Products"}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {loading
            ? "Loading products…"
            : `${filtered.length} ${filtered.length === 1 ? "product" : "products"} available`}
        </p>
      </div>

      <div className="mb-6 max-w-lg">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mb-8">
        <FilterPanel
          activeCategory={category}
          onCategoryChange={updateCategory}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      <ProductGrid products={filtered} />
    </div>
  );
}
