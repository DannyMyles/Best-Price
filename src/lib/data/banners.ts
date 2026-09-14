import type { Banner } from "@/lib/types";
import { categoryImages, heroImages } from "@/lib/data/categoryImages";

/** Seed / fallback banner list for the homepage carousel. Firestore's
 *  `banners` collection overrides this once configured (managed from
 *  /admin/banners). */
export const banners: Banner[] = [
  {
    id: "welcome",
    eyebrow: "PriceHub",
    headline: "The best way to buy the tech you love.",
    subcopy:
      "Every major brand, genuine and fairly priced — delivered anywhere in Kenya, or collected at our Nairobi CBD shop.",
    image: heroImages[0],
    ctaLabel: "Shop all products",
    ctaHref: "/products",
    active: true,
    order: 0,
  },
  {
    id: "laptops-deal",
    eyebrow: "Work. Create. Play.",
    headline: "Save up to KES 15,000 on select laptops.",
    subcopy: "MacBooks and Windows laptops, genuine stock, while it lasts.",
    image: categoryImages.laptops[1],
    badge: "Deal",
    ctaLabel: "Shop laptops",
    ctaHref: "/products?category=laptops",
    active: true,
    order: 1,
  },
  {
    id: "cameras-new",
    eyebrow: "Just landed",
    headline: "New mirrorless cameras are here.",
    subcopy: "Capture more with the latest bodies and glass from Canon and Sony.",
    image: categoryImages.cameras[0],
    badge: "New",
    ctaLabel: "Shop cameras",
    ctaHref: "/products?category=cameras",
    active: true,
    order: 2,
  },
  {
    id: "tv-bundle",
    eyebrow: "Bigger picture",
    headline: "4K smart TVs, bundled and discounted.",
    subcopy: "Sony and Hisense TVs at their lowest prices this month.",
    image: categoryImages.tvs[0],
    ctaLabel: "Shop TVs",
    ctaHref: "/products?category=tvs",
    active: true,
    order: 3,
  },
];

export function sortBanners(list: Banner[]): Banner[] {
  return [...list]
    .filter((b) => b.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
