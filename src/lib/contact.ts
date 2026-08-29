/** Single source of truth for PriceHub contact + payment details.
 *  Swap these for real values (or env vars) before going live. */

export const BRAND_NAME = "PriceHub";
export const BRAND_TAGLINE = "The best price on the tech you want";

/** WhatsApp / phone — digits only, 2547XXXXXXXX form for wa.me + tel: links. */
export const WHATSAPP_NUMBER = "254721966663";

/** Number customers Send Money to on M-Pesa, in local display form. */
export const MPESA_PAYBILL_NUMBER = "0721 966663";
export const MPESA_ACCOUNT_NAME = "PriceHub";

export const SUPPORT_PHONE_DISPLAY = "+254 721 966663";
export const SUPPORT_EMAIL = "sales@pricehub.co.ke";

export const STORE_ADDRESS = "Bihi Towers, G7 Ground Floor, Nairobi CBD, Kenya";
export const STORE_MAPS_URL =
  "https://www.google.com/maps?q=Bihi+Towers,+Nairobi+CBD,+Kenya";
export const STORE_HOURS = "Mon–Sat, 9am – 6pm";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
