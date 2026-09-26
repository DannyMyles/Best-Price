import { fetchActiveBanners } from "@/lib/api/banners";
import { fetchCategories } from "@/lib/api/categories";
import type { Banner } from "@/lib/types";

/** Rotated across the built-in department slides so they don't all look alike. */
const FALLBACK_ACCENTS = ["#178549", "#ffc20e", "#1a6fc9", "#f26b1d", "#d7182a"];

/** One slide per department (max 6), built from the server's category photos.
 *  Shown on the homepage until the admin saves slides of their own. */
export async function departmentSlides(): Promise<Banner[]> {
  const categories = await fetchCategories();
  return categories
    .filter((c) => c.image)
    .slice(0, 6)
    .map((c, i) => ({
      id: `category-${c.slug}`,
      headline: c.name,
      subcopy: c.description || undefined,
      image: c.image!,
      // Category photos are product shots on white; the hero cuts them out.
      layout: "product" as const,
      badge: c.productCount ? `${c.productCount} products` : "Shop now",
      accent: FALLBACK_ACCENTS[i % FALLBACK_ACCENTS.length],
      ctaLabel: `Shop ${c.shortName}`,
      ctaHref: `/products?category=${c.slug}`,
      cta2Label: "All deals",
      cta2Href: "/products",
      active: true,
      order: i,
    }));
}

/**
 * Slides for the homepage carousel. Admin-managed banners win. If none exist
 * yet, one slide per department is shown, so the hero is never empty.
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const remote = await fetchActiveBanners();
    if (remote.length > 0) return remote;
  } catch {
    /* fall through to department slides */
  }
  try {
    return await departmentSlides();
  } catch {
    return [];
  }
}
