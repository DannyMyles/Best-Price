export type CategorySlug =
  | "ipad"
  | "macbook-air"
  | "macbook"
  | "macbook-pro"
  | "imac"
  | "accessories"
  | "surface";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  icon: "tablet" | "laptop" | "monitor" | "puzzle" | "cpu";
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
}
