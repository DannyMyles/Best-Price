export type DeliveryMethod = "pickup" | "courier";

export interface DeliveryOption {
  method: DeliveryMethod;
  label: string;
  description: string;
  eta: string;
  /** Fee resolver — takes the selected county. */
  fee: (county: string | null) => number;
}

const NAIROBI_METRO = new Set(["Nairobi", "Kiambu", "Kajiado", "Machakos"]);

/** Flat, transparent courier pricing — no surprises at the last step. */
export function courierFee(county: string | null): number {
  if (!county) return 350;
  if (county === "Nairobi") return 250;
  if (NAIROBI_METRO.has(county)) return 350;
  return 550;
}

export const deliveryOptions: DeliveryOption[] = [
  {
    method: "pickup",
    label: "Pickup — Nairobi CBD",
    description: "Collect free from Bihi Towers, G7 Ground Floor.",
    eta: "Ready same day",
    fee: () => 0,
  },
  {
    method: "courier",
    label: "Countrywide courier",
    description: "Door-to-door delivery via our courier partners.",
    eta: "2–5 business days",
    fee: (county) => courierFee(county),
  },
];

export function deliveryFeeFor(
  method: DeliveryMethod,
  county: string | null
): number {
  return method === "pickup" ? 0 : courierFee(county);
}

export function deliveryEtaFor(method: DeliveryMethod): string {
  return method === "pickup" ? "Ready for pickup same day" : "2–5 business days";
}
