import { CategorySlug } from "@/lib/types";

/**
 * Category-representative stock photography (Unsplash License — free for
 * commercial use). Individual product photos aren't available for every
 * SKU, so products in the same category share the same reference shot.
 * Swap these for real product photography (or Firebase Storage URLs) at any time.
 */
export const categoryImages: Record<CategorySlug, string[]> = {
  ipad: ["https://images.unsplash.com/photo-1669691177924-f12fcc3cc540?q=80&w=1600&auto=format&fit=crop"],
  "macbook-air": ["https://images.unsplash.com/photo-1542767352-e98201e84ed8?q=80&w=1600&auto=format&fit=crop"],
  macbook: [
    "https://images.unsplash.com/photo-1710905219584-8521769e3678?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558625628-8b7292e0c335?q=80&w=1600&auto=format&fit=crop",
  ],
  "macbook-pro": ["https://images.unsplash.com/photo-1627766556564-5d89b3765c46?q=80&w=1600&auto=format&fit=crop"],
  imac: ["https://images.unsplash.com/photo-1527443195645-1133f7f28990?q=80&w=1600&auto=format&fit=crop"],
  surface: ["https://images.unsplash.com/photo-1587614380281-2824400605b2?q=80&w=1600&auto=format&fit=crop"],
  accessories: [
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1600&auto=format&fit=crop",
  ],
};

export const heroImages = [
  "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1920&auto=format&fit=crop",
];

export function getCategoryImages(category: CategorySlug): string[] {
  return categoryImages[category] ?? [];
}
