/** Categories are data-driven (Firestore `categories` collection / seed list),
 *  so a slug is just a string. Icons/colours/fallback images are resolved by
 *  lookup with sensible defaults — see `categoryIcon`, `categoryImages`,
 *  `ProductGlyph`. */
export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  /** A key understood by `categoryIcon()` — an icon name ("camera") or the
   *  slug itself. Unknown values fall back to a generic package icon. */
  icon: string;
  /** Hidden from the storefront when `false`. Defaults to `true`. */
  active?: boolean;
  /** Ascending sort key for nav / department order. Defaults to `0`. */
  order?: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export type ProductBadge =
  | "New"
  | "Best Seller"
  | "Popular"
  | "Sale"
  | "Clearance"
  | "Limited";

export interface Product {
  sku: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number | null;
  /** Optional "was" price — when higher than `price`, a Sale badge and a
   *  discount percentage are shown. */
  compareAtPrice?: number | null;
  description: string;
  specs: ProductSpec[];
  color?: string;
  inStock: boolean;
  /** Units on hand. 1–3 surfaces a "Low stock" badge; 0 means out of stock. */
  stockCount?: number | null;
  /** Average rating 0–5 and number of reviews. Ratings UI is hidden when
   *  `rating` is undefined. */
  rating?: number | null;
  reviewCount?: number | null;
  badge?: ProductBadge;
  /** Explicit image URLs (e.g. from Firebase Storage). Falls back to a
   *  category stock photo when empty. */
  images?: string[];
  featured?: boolean;
  /** Hidden from the storefront when `false`. Defaults to `true`. */
  active?: boolean;
  /** Lower ranks surface first in "featured" / homepage rails. */
  featureRank?: number | null;
}
