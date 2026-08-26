import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  fetchAllProducts,
  fetchProductBySlug,
  fetchFeaturedProducts,
} from "@/lib/firebase/products";
import { products as seedProducts, getProduct as getSeedProduct } from "@/lib/data/products";
import type { Product } from "@/lib/types";
import type { SortOption } from "@/components/product/FilterPanel";

/**
 * Firestore is the source of truth once a project is configured; until
 * then (or if a read fails) we fall back to the bundled seed catalogue so
 * the storefront keeps working out of the box.
 */
export async function getProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured) return seedProducts;
  try {
    const remote = await fetchAllProducts();
    return remote.length > 0 ? remote : seedProducts;
  } catch {
    return seedProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isFirebaseConfigured) return getSeedProduct(slug) ?? null;
  try {
    const remote = await fetchProductBySlug(slug);
    return remote ?? getSeedProduct(slug) ?? null;
  } catch {
    return getSeedProduct(slug) ?? null;
  }
}

export async function getFeaturedProducts(max = 8): Promise<Product[]> {
  if (!isFirebaseConfigured) return seedProducts.filter((p) => p.badge).slice(0, max);
  try {
    const remote = await fetchFeaturedProducts(max);
    return remote.length > 0 ? remote : seedProducts.filter((p) => p.badge).slice(0, max);
  } catch {
    return seedProducts.filter((p) => p.badge).slice(0, max);
  }
}

export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export function getRelatedProducts(all: Product[], product: Product, max = 4): Product[] {
  return all.filter((p) => p.category === product.category && p.sku !== product.sku).slice(0, max);
}

export function filterAndSortProducts(
  products: Product[],
  { category, query, sort }: { category?: string | null; query?: string; sort?: SortOption }
): Product[] {
  let list = products;
  if (category) list = list.filter((p) => p.category === category);
  if (query) list = searchProducts(list, query);

  const sorted = [...list];
  if (sort === "price-asc") {
    sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sort === "price-desc") {
    sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  } else if (sort === "name-asc") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}
