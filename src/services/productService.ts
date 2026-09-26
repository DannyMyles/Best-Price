import { fetchAllProducts, fetchProductBySlug } from "@/lib/api/products";
import type { Product } from "@/lib/types";
import type { SortOption } from "@/lib/productFilters";

/** The backend API is the source of truth; it only returns visible products. */
export async function getProducts(): Promise<Product[]> {
  return fetchAllProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return fetchProductBySlug(slug);
}

export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  const terms = q.split(/\s+/).filter(Boolean);
  return products.filter((p) => {
    const haystack = [
      p.name,
      p.sku,
      p.category.replace(/-/g, " "),
      p.color ?? "",
      p.description,
      ...p.specs.map((s) => `${s.label} ${s.value}`),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export function getRelatedProducts(all: Product[], product: Product, max = 4): Product[] {
  return all.filter((p) => p.category === product.category && p.sku !== product.sku).slice(0, max);
}

function baseName(p: Product): string {
  if (!p.color) return p.name.trim().toLowerCase();
  return p.name
    .replace(new RegExp(`\\s*${p.color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "")
    .trim()
    .toLowerCase();
}

/** Sibling products that are the same model in a different colour. Returns
 *  the current product plus its colour variants (2+), or [] when there is
 *  no meaningful variant group. */
export function getColorVariants(all: Product[], product: Product): Product[] {
  if (!product.color) return [];
  const base = baseName(product);
  const group = all.filter((p) => p.color && baseName(p) === base);
  return group.length >= 2 ? group : [];
}

/** Home-page rail selectors — each is defensive so an empty result just
 *  hides the rail rather than erroring. */

/** Worth putting on the homepage: priced, photographed and in stock. */
const presentable = (p: Product) => p.price !== null && (p.images?.length ?? 0) > 0 && p.inStock;

/** Takes one product per department in turn, so a rail shows variety
 *  instead of eight near-identical items from the first category. */
function spreadAcrossCategories(list: Product[], max: number): Product[] {
  const byCat = new Map<string, Product[]>();
  for (const p of list) byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
  const queues = [...byCat.values()];
  const out: Product[] = [];
  while (out.length < max && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && out.length < max) out.push(next);
    }
  }
  return out;
}

export function selectBestSellers(all: Product[], max = 8): Product[] {
  const picked = all.filter(
    (p) => p.badge === "Best Seller" || p.badge === "Popular" || p.featured
  );
  if (picked.length >= 4) return picked.slice(0, max);
  // Nothing flagged yet: rank by feature rank, then reviews, across departments.
  const ranked = all
    .filter((p) => presentable(p) && !picked.includes(p))
    .sort(
      (a, b) =>
        (a.featureRank ?? Infinity) - (b.featureRank ?? Infinity) ||
        (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
    );
  return [...picked, ...spreadAcrossCategories(ranked, max)].slice(0, max);
}

/** Products tagged "New" first, then the most recently added. `exclude`
 *  keeps it from repeating what another rail already shows. */
export function selectNewArrivals(all: Product[], max = 8, exclude: Set<string> = new Set()): Product[] {
  const fresh = all.filter((p) => !exclude.has(p.sku));
  const tagged = fresh.filter((p) => p.badge === "New");
  if (tagged.length >= 4) return tagged.slice(0, max);
  const newest = fresh
    .filter((p) => presentable(p) && p.badge !== "New")
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  return [...tagged, ...spreadAcrossCategories(newest, max)].slice(0, max);
}

export function isDeal(p: Product): boolean {
  return (
    p.badge === "Sale" ||
    p.badge === "Clearance" ||
    (p.price !== null &&
      typeof p.compareAtPrice === "number" &&
      p.compareAtPrice > p.price)
  );
}

export function selectDeals(all: Product[], max = 8): Product[] {
  return all.filter(isDeal).slice(0, max);
}

/** Complementary items to offer as a "frequently bought together" bundle. */
export function selectBundle(
  all: Product[],
  product: Product,
  max = 2
): Product[] {
  const pool = all.filter(
    (p) => p.sku !== product.sku && p.inStock && p.price !== null
  );
  const prefer =
    product.category === "cameras"
      ? ["lenses", "accessories"]
      : product.category === "accessories"
        ? ["accessories"]
        : ["accessories"];
  const picks: Product[] = [];
  for (const cat of prefer) {
    for (const p of pool.filter((p) => p.category === cat)) {
      if (picks.length >= max) break;
      if (!picks.some((x) => x.sku === p.sku)) picks.push(p);
    }
  }
  return picks.slice(0, max);
}

export function selectRecommended(
  all: Product[],
  recentCategories: string[],
  max = 8
): Product[] {
  if (recentCategories.length === 0) return all.slice(0, max);
  const set = new Set(recentCategories);
  const inCats = all.filter((p) => set.has(p.category));
  return (inCats.length >= 4 ? inCats : all).slice(0, max);
}

export interface ProductFilters {
  category?: string | null;
  query?: string;
  sort?: SortOption;
  minPrice?: number | null;
  maxPrice?: number | null;
  inStockOnly?: boolean;
  minRating?: number | null;
}

export function filterAndSortProducts(
  products: Product[],
  {
    category,
    query,
    sort,
    minPrice,
    maxPrice,
    inStockOnly,
    minRating,
  }: ProductFilters
): Product[] {
  let list = products;
  if (category) list = list.filter((p) => p.category === category);
  if (query) list = searchProducts(list, query);
  if (typeof minPrice === "number")
    list = list.filter((p) => p.price !== null && p.price >= minPrice);
  if (typeof maxPrice === "number")
    list = list.filter((p) => p.price !== null && p.price <= maxPrice);
  if (inStockOnly)
    list = list.filter((p) => p.inStock && p.stockCount !== 0);
  if (typeof minRating === "number")
    list = list.filter((p) => (p.rating ?? 0) >= minRating);

  const sorted = [...list];
  if (sort === "price-asc") {
    sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sort === "price-desc") {
    sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  } else if (sort === "name-asc") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "rating-desc") {
    sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  return sorted;
}

export function priceBounds(products: Product[]): [number, number] {
  const prices = products
    .map((p) => p.price)
    .filter((p): p is number => p !== null);
  if (prices.length === 0) return [0, 0];
  return [Math.min(...prices), Math.max(...prices)];
}
