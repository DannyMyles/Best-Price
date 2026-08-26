import { CategorySlug } from "@/lib/types";

/**
 * Category-representative stock photography (Unsplash License — free for
 * commercial use). Index 0 of each array is reserved for the category tile
 * (CategoryGrid) — individual products get their own explicit `images`
 * override (see lib/data/products.ts) drawn from index 1+ so a product grid
 * doesn't repeat the same photo across every card. Swap these for real
 * product photography (or Firebase Storage URLs) at any time.
 */
export const categoryImages: Record<CategorySlug, string[]> = {
  ipad: [
    "https://images.unsplash.com/photo-1669691177924-f12fcc3cc540?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524600870520-229b3f2cc406?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1679759799183-8899c0d67b43?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585789574212-15ee78d0e7d9?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565443492615-7e3d2324d925?q=80&w=1600&auto=format&fit=crop",
  ],
  "macbook-air": [
    "https://images.unsplash.com/photo-1542767352-e98201e84ed8?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1628115367019-607aedaee62a?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1600&auto=format&fit=crop",
  ],
  macbook: [
    "https://images.unsplash.com/photo-1710905219584-8521769e3678?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558625628-8b7292e0c335?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620116377917-3998e4937a3a?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529405147636-6aaa3abe9536?q=80&w=1600&auto=format&fit=crop",
  ],
  "macbook-pro": [
    "https://images.unsplash.com/photo-1627766556564-5d89b3765c46?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1465418031253-26bca286214c?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531938716357-224c16b5ace3?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1733325021308-1c114fbef778?q=80&w=1600&auto=format&fit=crop",
  ],
  imac: [
    "https://images.unsplash.com/photo-1527443195645-1133f7f28990?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601919263076-4a6a8514c461?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483388147740-e5c70536042e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1495521939206-a217db9df264?q=80&w=1600&auto=format&fit=crop",
  ],
  surface: [
    "https://images.unsplash.com/photo-1587614380281-2824400605b2?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1665686310429-ee43624978fa?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587613842578-f811e043c1be?q=80&w=1600&auto=format&fit=crop",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1630515787921-0086c7cca853?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1600&auto=format&fit=crop",
  ],
};

export const heroImages = [
  "https://images.unsplash.com/photo-1507470828332-ab3b90a0a13f?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1772115428479-9045bc0c2a3d?q=80&w=1920&auto=format&fit=crop",
];

export function getCategoryImages(category: CategorySlug): string[] {
  return categoryImages[category] ?? [];
}
