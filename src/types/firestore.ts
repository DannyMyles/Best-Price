import type { Timestamp } from "firebase/firestore";
import type { CategorySlug, ProductSpec, ProductBadge } from "@/lib/types";

/** products/{id} — the document id doubles as the product slug. */
export interface ProductDoc {
  sku: string;
  name: string;
  category: CategorySlug;
  price: number | null;
  compareAtPrice?: number | null;
  description: string;
  specs: ProductSpec[];
  color?: string;
  images: string[];
  inStock: boolean;
  stockCount?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  featured: boolean;
  badge?: ProductBadge;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/** categories/{id} */
export interface CategoryDoc {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  image?: string;
  active: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "mpesa" | "cod" | "bank";

export interface OrderItem {
  sku: string;
  name: string;
  slug: string;
  price: number | null;
  color?: string;
  quantity: number;
}

/** orders/{id} */
export interface OrderDoc {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    county?: string;
    town?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryMethod?: "pickup" | "courier";
  deliveryFee?: number;
  total?: number;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** M-Pesa "Send Money" confirmation, captured at checkout when provided. */
  mpesaCode?: string;
  mpesaName?: string;
  status: OrderStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/** reviews/{id} */
export interface ReviewDoc {
  productSku: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  approved: boolean;
  createdAt?: Timestamp;
}

export type UserRole = "admin" | "customer";

/** users/{uid} */
export interface UserDoc {
  uid: string;
  email: string;
  role: UserRole;
  createdAt?: Timestamp;
}
