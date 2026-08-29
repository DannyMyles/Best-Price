import type { Product } from "@/lib/types";
import type { ProductDoc } from "@/types/firestore";
import { slugify } from "@/lib/format";

/** Single source of truth for the bulk product CSV — import and export
 *  share this column order so a round-trip (export → edit → import) is
 *  loss-free for everything except per-product specs. */
export const PRODUCT_CSV_COLUMNS = [
  "sku",
  "name",
  "category",
  "price",
  "compareAtPrice",
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
  "image1",
  "image2",
  "image3",
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

/** Turn one parsed CSV row into a product doc, or return an error string. */
export function csvRowToProductDoc(
  r: Record<string, string>
): { slug: string; doc: Omit<ProductDoc, "createdAt" | "updatedAt"> } | { error: string } {
  const label = r.name || r.sku || "row";
  if (!r.sku?.trim() || !r.name?.trim() || !r.category?.trim()) {
    return { error: `${label}: missing sku, name or category` };
  }
  const slug = slugify(`${r.name}-${r.sku}`);
  return {
    slug,
    doc: {
      sku: r.sku.trim(),
      name: r.name.trim(),
      category: r.category.trim().toLowerCase(),
      price: num(r.price),
      compareAtPrice: num(r.compareAtPrice),
      description: r.description?.trim() ?? "",
      specs: [],
      color: r.color?.trim() || undefined,
      images: [r.image1, r.image2, r.image3].filter((u) => u && u.trim()),
      inStock: bool(r.inStock, true),
      stockCount: num(r.stockCount),
      rating: num(r.rating),
      reviewCount: num(r.reviewCount),
      badge: (r.badge?.trim() as ProductDoc["badge"]) || null,
      featureRank: num(r.featureRank),
      featured: bool(r.featured, false),
      active: bool(r.active, true),
    },
  };
}

/** Serialise a product for CSV export (keys match PRODUCT_CSV_COLUMNS). */
export function productToCsvRow(p: Product): Record<string, string | number | null> {
  const imgs = p.images ?? [];
  return {
    sku: p.sku,
    name: p.name,
    category: p.category,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? "",
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
    image1: imgs[0] ?? "",
    image2: imgs[1] ?? "",
    image3: imgs[2] ?? "",
  };
}
