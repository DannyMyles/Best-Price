/** Categories are data-driven (managed in /admin/categories),
 *  so a slug is just a string. Icons/colours/fallback images are resolved by
 *  lookup with sensible defaults — see `categoryIcon`,
 *  `ProductGlyph`. */
export type CategorySlug = string;

export interface Category {
  id?: number;
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
  /** Number of (active) products in the department. */
  productCount?: number;
  /** Photo of one of the department's products, from the server (null when none). */
  image?: string | null;
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

export type BannerLayout = "photo" | "product";

export interface Banner {
  /** Numeric for saved banners, a string for the built-in fallback slides. */
  id: string | number;
  eyebrow?: string;
  headline: string;
  subcopy?: string;
  image: string;
  /** "photo": full-bleed lifestyle picture with white copy over a dark scrim.
   *  "product": product shot on a white background, shown on a light stage
   *  with dark copy. Defaults to "photo". */
  layout?: BannerLayout;
  /** "#rrggbb" — colour of the badge and the primary button. */
  accent?: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Optional secondary (outline) button, e.g. "Learn More". */
  cta2Label?: string;
  cta2Href?: string;
  /** ISO datetime. When set and in the future, the slide shows a live
   *  "Ends in HH:MM:SS" countdown chip (flash-deal urgency). */
  dealEndsAt?: string | null;
  /** Hidden from the storefront when `false`. Defaults to `true`. */
  active?: boolean;
  /** Ascending display order. Defaults to `0`. */
  order?: number;
}

export interface Product {
  /** Database id (used by the admin API). */
  id?: number;
  sku: string;
  slug: string;
  name: string;
  category: CategorySlug;
  brand?: string | null;
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
  /** Photo URLs, primary image first (served from the pricehub image
   *  library). Falls back to a category stock photo when empty. */
  images?: string[];
  featured?: boolean;
  /** Hidden from the storefront when `false`. Defaults to `true`. */
  active?: boolean;
  /** Lower ranks surface first in "featured" / homepage rails. */
  featureRank?: number | null;
  adminNotes?: string | null;
}

// --- orders / reviews -------------------------------------------------------
export type OrderStatus = "pending" | "confirmed" | "processing" | "dispatched" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "mpesa" | "cod" | "bank";

export interface OrderItem {
  sku: string;
  name: string;
  slug: string;
  price: number | null;
  color?: string | null;
  quantity: number;
}

export interface Order {
  id: number;
  /** Customer-facing reference, e.g. "PH-K7Q2XM" — used by /track. */
  ref: string;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    address: string;
    county?: string | null;
    town?: string | null;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryMethod: "pickup" | "courier";
  deliveryFee: number;
  total: number;
  notes?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaCode?: string | null;
  mpesaName?: string | null;
  status: OrderStatus;
  /** Courier details, shown to the customer on /track. */
  courier?: string | null;
  trackingNumber?: string | null;
  /** "YYYY-MM-DD" */
  expectedDelivery?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdminReview extends Review {
  productId: number;
  productSku: string;
  productName: string;
  productSlug: string;
  approved: boolean;
}
