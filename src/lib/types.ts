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

export interface Product {
  sku: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number | null;
  description: string;
  specs: ProductSpec[];
  color?: string;
  inStock: boolean;
  badge?: "New" | "Best Seller" | "Limited";
  /** Explicit image URLs (e.g. from Firebase Storage). Falls back to a
   *  category stock photo when empty. */
  images?: string[];
  featured?: boolean;
}
