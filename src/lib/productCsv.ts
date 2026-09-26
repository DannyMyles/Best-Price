import type { Product } from "@/lib/types";
import type { ProductInput } from "@/lib/api/products";

/** Single source of truth for the bulk product CSV — import and export
 *  share this column order so a round-trip (export → edit → import) is
 *  loss-free for everything except specs and photos (photos are managed per
 *  product in the editor, since they are stored in the database). */
export const PRODUCT_CSV_COLUMNS = [
  "sku",
  "name",
  "category",
  "price",
  "compareAtPrice",
  "brand",
  "description",
  "color",
  "stockCount",
  "rating",
  "reviewCount",
  "badge",
  "featureRank",
  "featured",
  "active",
  "inStock",
] as const;

function num(v: string): number | null {
  if (!v || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(v: string, dflt: boolean): boolean {
  if (!v) return dflt;
  return /^(true|yes|y|1)$/i.test(v.trim());
}

/** Turn one parsed CSV row into an API product payload, or return an error string. */
export function csvRowToProductInput(
  r: Record<string, string>
): { input: ProductInput } | { error: string } {
  const label = r.name || r.sku || "row";
  if (!r.sku?.trim() || !r.name?.trim() || !r.category?.trim()) {
    return { error: `${label}: missing sku, name or category` };
  }
  return {
    input: {
      sku: r.sku.trim(),
      name: r.name.trim(),
      category: r.category.trim().toLowerCase(),
      brand: r.brand?.trim() || null,
      price: num(r.price),
      compareAtPrice: num(r.compareAtPrice),
      description: r.description?.trim() ?? "",
      color: r.color?.trim() || null,
      inStock: bool(r.inStock, true),
      stockCount: num(r.stockCount),
      rating: num(r.rating),
      reviewCount: num(r.reviewCount),
      badge: (r.badge?.trim() as ProductInput["badge"]) || null,
      featureRank: num(r.featureRank),
      featured: bool(r.featured, false),
      active: bool(r.active, true),
    },
  };
}

/** Serialise a product for CSV export (keys match PRODUCT_CSV_COLUMNS). */
export function productToCsvRow(p: Product): Record<string, string | number | null> {
  return {
    sku: p.sku,
    name: p.name,
    category: p.category,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? "",
    brand: p.brand ?? "",
    description: p.description,
    color: p.color ?? "",
    stockCount: p.stockCount ?? "",
    rating: p.rating ?? "",
    reviewCount: p.reviewCount ?? "",
    badge: p.badge ?? "",
    featureRank: p.featureRank ?? "",
    featured: p.featured ? "true" : "false",
    active: p.active === false ? "false" : "true",
    inStock: p.inStock ? "true" : "false",
  };
}
