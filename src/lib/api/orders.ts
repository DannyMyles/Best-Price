import { api } from "./client";
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";
import type { Page } from "./products";

export interface OrderPayload {
  ref?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    county?: string;
    town?: string;
  };
  /** Only SKU + quantity are sent — prices and names come from the server. */
  items: { sku: string; quantity: number }[];
  deliveryMethod: "pickup" | "courier";
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  mpesaCode?: string;
  mpesaName?: string;
  notes?: string;
}

export interface PlacedOrder {
  ref: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: "pickup" | "courier";
  deliveryFee: number;
  subtotal: number;
  total: number;
  items: { sku: string; name: string; price: number | null; quantity: number }[];
  createdAt: string;
}

export const placeOrder = (payload: OrderPayload) =>
  api<PlacedOrder>("/orders", { method: "POST", json: payload });

export interface TrackedOrder {
  ref: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  placedAt: string;
  updatedAt: string;
  deliveryMethod: "pickup" | "courier";
  county: string | null;
  itemCount: number;
  total: number;
  paymentMethod: "mpesa" | "cod" | "bank";
  /** An M-Pesa code was entered at checkout (payment may still be unconfirmed). */
  mpesaCodeSubmitted: boolean;
  courier: string | null;
  trackingNumber: string | null;
  /** "YYYY-MM-DD" */
  expectedDelivery: string | null;
}

export const trackOrder = (ref: string, phone: string) =>
  api<TrackedOrder>("/orders/track", { method: "POST", json: { ref, phone } });

// --- admin ----------------------------------------------------------------------
export interface OrderQuery {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  q?: string;
  page?: number;
  limit?: number;
}

export const adminOrders = (query: OrderQuery = {}) =>
  api<Page<Order>>("/admin/orders", { query: query as Record<string, string | number | undefined> });

export interface OrderPatch {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  courier?: string | null;
  trackingNumber?: string | null;
  expectedDelivery?: string | null;
}

export const adminUpdateOrder = (id: number, patch: OrderPatch) =>
  api<Order>(`/admin/orders/${id}`, { method: "PATCH", json: patch });

export const adminGetOrder = (id: number) => api<Order>(`/admin/orders/${id}`);
