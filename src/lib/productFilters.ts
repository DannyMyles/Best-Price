import type { ReadonlyURLSearchParams } from "next/navigation";

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "rating-desc";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Top rated" },
  { value: "name-asc", label: "Name: A to Z" },
];

export interface ProductFilterState {
  category: string | null;
  query: string;
  sort: SortOption;
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  minRating: number | null;
}

export const emptyFilters: ProductFilterState = {
  category: null,
  query: "",
  sort: "featured",
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  minRating: null,
};

function num(value: string | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseFilters(
  params: URLSearchParams | ReadonlyURLSearchParams
): ProductFilterState {
  const sort = params.get("sort") as SortOption | null;
  return {
    category: params.get("category") || null,
    query: params.get("q") ?? "",
    sort:
      sort && sortOptions.some((o) => o.value === sort) ? sort : "featured",
    minPrice: num(params.get("min")),
    maxPrice: num(params.get("max")),
    inStockOnly: params.get("instock") === "1",
    minRating: num(params.get("rating")),
  };
}

export function filtersToParams(f: ProductFilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.category) p.set("category", f.category);
  if (f.query.trim()) p.set("q", f.query.trim());
  if (f.sort !== "featured") p.set("sort", f.sort);
  if (f.minPrice != null) p.set("min", String(f.minPrice));
  if (f.maxPrice != null) p.set("max", String(f.maxPrice));
  if (f.inStockOnly) p.set("instock", "1");
  if (f.minRating != null) p.set("rating", String(f.minRating));
  return p;
}

export function activeFilterCount(f: ProductFilterState): number {
  let n = 0;
  if (f.category) n++;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.inStockOnly) n++;
  if (f.minRating != null) n++;
  return n;
}
