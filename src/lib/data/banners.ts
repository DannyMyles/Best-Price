import type { Banner } from "@/lib/types";
import { categoryImages, heroImages } from "@/lib/data/categoryImages";

/** A live countdown for the seed data's flash-deal slide, so the carousel
 *  always shows a plausible "ends in" window during local dev — real deals
 *  get a fixed date from /admin/banners once Firestore is configured. */
function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

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
  {
    id: "phones-flash",
    eyebrow: "Everyday essentials",
    headline: "Flagship phones, unlocked and genuine.",
    subcopy: "The latest iPhones and Android flagships — verified stock, full warranty.",
    image: categoryImages.phones[0],
    badge: "Flash Deal",
    dealEndsAt: hoursFromNow(9),
    ctaLabel: "Shop phones",
    ctaHref: "/products?category=phones",
    active: true,
    order: 4,
  },
  {
    id: "audio-week",
    eyebrow: "Hear the difference",
    headline: "Soundbars and headphones, this week only.",
    subcopy: "Studio-grade audio from brands you already trust.",
    image: categoryImages.audio[0],
    ctaLabel: "Shop audio",
    ctaHref: "/products?category=audio",
    active: true,
    order: 5,
  },
  {
    id: "accessories-restock",
    eyebrow: "Just restocked",
    headline: "The small stuff that makes the big stuff work.",
    subcopy: "Keyboards, mice, storage and cables — genuine, in stock, ready today.",
    image: categoryImages.accessories[0],
    badge: "New",
    ctaLabel: "Shop accessories",
    ctaHref: "/products?category=accessories",
    active: true,
    order: 6,
  },
  {
    id: "tablets-creative",
    eyebrow: "Creativity on the go",
    headline: "iPad and Android tablets for work and play.",
    subcopy: "Sketch, stream, study — genuine tablets with real Kenyan warranty support.",
    image: categoryImages.tablets[0],
    ctaLabel: "Shop tablets",
    ctaHref: "/products?category=tablets",
    active: true,
    order: 7,
  },
  {
    id: "desktops-workstation",
    eyebrow: "Built for the desk",
    headline: "Desktops and all-in-ones that mean business.",
    subcopy: "iMacs and Windows desktops for the office, the studio, or the home setup.",
    image: categoryImages.desktops[0],
    ctaLabel: "Shop desktops",
    ctaHref: "/products?category=desktops",
    active: true,
    order: 8,
  },
  {
    id: "lenses-glass",
    eyebrow: "Every angle covered",
    headline: "Lenses for Canon, Nikon and Sony bodies.",
    subcopy: "Primes, zooms and everything in between — genuine glass, tested before it ships.",
    image: categoryImages.lenses[0],
    badge: "New",
    ctaLabel: "Shop lenses",
    ctaHref: "/products?category=lenses",
    active: true,
    order: 9,
  },
  {
    id: "warranty-trust",
    eyebrow: "Why PriceHub",
    headline: "Genuine stock. Real warranty. No surprises.",
    subcopy: "Every device we sell is backed by a manufacturer warranty and a team that actually picks up the phone.",
    image: heroImages[1],
    ctaLabel: "Read our story",
    ctaHref: "/about",
    active: true,
    order: 10,
  },
];

export function sortBanners(list: Banner[]): Banner[] {
  return [...list]
    .filter((b) => b.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
