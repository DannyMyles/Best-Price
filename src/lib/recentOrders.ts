/**
 * Orders placed (or tracked) on this device, so /track can offer them with one
 * tap instead of making the customer find their reference again. Kept only in
 * this browser's localStorage; nothing is sent anywhere.
 */
export interface RecentOrder {
  ref: string;
  phone: string;
  total?: number;
  placedAt?: string;
}

const KEY = "pricehub-orders";
const MAX = 8;

export function getRecentOrders(): RecentOrder[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((o) => o && typeof o.ref === "string" && typeof o.phone === "string") : [];
  } catch {
    return [];
  }
}

export function rememberOrder(order: RecentOrder) {
  try {
    const rest = getRecentOrders().filter((o) => o.ref !== order.ref);
    window.localStorage.setItem(KEY, JSON.stringify([order, ...rest].slice(0, MAX)));
  } catch {
    /* storage unavailable (private mode) — tracking still works by typing */
  }
}

export function forgetOrder(ref: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(getRecentOrders().filter((o) => o.ref !== ref)));
  } catch {
    /* ignore */
  }
}
