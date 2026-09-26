import { api } from "./client";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export interface AdminStats {
  products: number;
  categories: number;
  pendingOrders: number;
  awaitingPayment: number;
  revenue: number;
  pendingReviews: number;
  lowStock: { id: number; slug: string; name: string; stockCount: number }[];
  recentOrders: {
    id: number;
    ref: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
  }[];
}

export const adminStats = () => api<AdminStats>("/admin/stats");
