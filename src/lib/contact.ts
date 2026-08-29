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
export const SUPPORT_EMAIL = "ballyudin@outlook.com";

export const STORE_ADDRESS = "Bihi Towers, G7 Ground Floor, Nairobi CBD, Kenya";
export const STORE_MAPS_URL =
  "https://www.google.com/maps?q=Bihi+Towers,+Nairobi+CBD,+Kenya";
export const STORE_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("Bihi Towers, Moi Avenue, Nairobi CBD, Kenya");
export const STORE_HOURS = "Mon–Sat, 9am – 6pm";
export const STORE_HOURS_NOTE = "Closed Sundays & public holidays";
/** Approximate — update to the exact pin before launch. */
export const STORE_GEO = { lat: -1.2841, lng: 36.8256 };

export const FACEBOOK_URL = "https://www.facebook.com/BallytechElectronicsKe/";
export const INSTAGRAM_URL = "https://www.instagram.com/ballytechelectronics";
export const TIKTOK_URL = "https://www.tiktok.com/@ballytechelectronics";

/** All public social profiles, for footer icons + JSON-LD `sameAs`. */
export const SOCIAL_LINKS = [
  { name: "Facebook", href: FACEBOOK_URL },
  { name: "Instagram", href: INSTAGRAM_URL },
  { name: "TikTok", href: TIKTOK_URL },
] as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
