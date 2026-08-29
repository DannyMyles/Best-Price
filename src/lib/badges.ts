import type { Product } from "@/lib/types";

export type BadgeVariant =
  | "new"
  | "best-seller"
  | "popular"
  | "sale"
  | "low-stock"
  | "limited";

export const badgeConfig: Record<
  BadgeVariant,
  { label: string; className: string }
> = {
  new: { label: "New", className: "bg-brand text-white" },
  "best-seller": { label: "Best Seller", className: "bg-panel-dark text-white" },
  popular: { label: "Popular", className: "bg-brand-050 text-brand" },
  sale: { label: "Sale", className: "bg-accent text-white" },
  "low-stock": { label: "Low stock", className: "bg-warning-050 text-warning" },
  limited: { label: "Limited", className: "bg-panel-dark text-white" },
};

/** Legacy map kept for any direct string lookups. */
export const badgeStyles: Record<string, string> = {
  New: badgeConfig.new.className,
  "Best Seller": badgeConfig["best-seller"].className,
  Popular: badgeConfig.popular.className,
  Sale: badgeConfig.sale.className,
  Limited: badgeConfig.limited.className,
};

const explicitMap: Record<string, BadgeVariant> = {
  New: "new",
  "Best Seller": "best-seller",
  Popular: "popular",
  Sale: "sale",
  Limited: "limited",
};

/** Derives the badges to show for a product, most important first, de-duped.
 *  - explicit `product.badge`
 *  - `sale` when compareAtPrice is genuinely higher
 *  - `low-stock` when 1–3 units remain */
export function getProductBadges(product: Product): BadgeVariant[] {
  const out: BadgeVariant[] = [];
  const hasDiscount =
    product.price !== null &&
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  if (hasDiscount) out.push("sale");
  if (product.badge && explicitMap[product.badge])
    out.push(explicitMap[product.badge]);
  if (
    typeof product.stockCount === "number" &&
    product.stockCount > 0 &&
    product.stockCount <= 3
  )
    out.push("low-stock");

  return [...new Set(out)].slice(0, 2);
}

export function isOutOfStock(product: Product): boolean {
  if (product.stockCount === 0) return true;
  return !product.inStock;
}
