/**
 * Category-representative stock photography (Unsplash License — free for
 * commercial use). Index 0 of each array is reserved for the category tile
 * (CategoryGrid) — individual products get their own explicit `images`
 * override (see lib/data/products.ts). Swap these for real product
 * photography (or Firebase Storage URLs) at any time.
 */
export const categoryImages: Record<string, string[]> = {
  laptops: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1628115367019-607aedaee62a?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1465418031253-26bca286214c?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531938716357-224c16b5ace3?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587614380281-2824400605b2?q=80&w=1600&auto=format&fit=crop",
  ],
  phones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=1600&auto=format&fit=crop",
  ],
  tablets: [
    "https://images.unsplash.com/photo-1669691177924-f12fcc3cc540?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524600870520-229b3f2cc406?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585789574212-15ee78d0e7d9?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565443492615-7e3d2324d925?q=80&w=1600&auto=format&fit=crop",
  ],
  desktops: [
    "https://images.unsplash.com/photo-1527443195645-1133f7f28990?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601919263076-4a6a8514c461?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1483388147740-e5c70536042e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1495521939206-a217db9df264?q=80&w=1600&auto=format&fit=crop",
  ],
  cameras: [
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=1600&auto=format&fit=crop",
  ],
  lenses: [
    "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=1600&auto=format&fit=crop",
  ],
  tvs: [
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1467293622093-9f15c96be70f?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=1600&auto=format&fit=crop",
  ],
  audio: [
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1600&auto=format&fit=crop",
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

/** Falls back to accessories imagery for any unknown / not-yet-photographed
 *  category so tiles and glyphs never render blank. */
export function getCategoryImages(category: string): string[] {
  return categoryImages[category] ?? categoryImages.accessories ?? [];
}
