import { fetchActiveBanners } from "@/lib/api/banners";
import { fetchCategories } from "@/lib/api/categories";
import type { Banner } from "@/lib/types";

/**
 * Slides for the homepage carousel. Admin-managed banners win. If none exist
 * yet, one slide per department is built from the server's category photos, so
 * the hero is never empty and never uses bundled images.
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const remote = await fetchActiveBanners();
    if (remote.length > 0) return remote;
  } catch {
    /* fall through to category slides */
  }
  try {
    const categories = await fetchCategories();
    return categories
      .filter((c) => c.image)
      .slice(0, 6)
      .map((c, i) => ({
        id: `category-${c.slug}`,
        eyebrow: "PriceHub",
        headline: c.name,
        subcopy: c.description || undefined,
        image: c.image!,
        ctaLabel: `Shop ${c.shortName}`,
        ctaHref: `/products?category=${c.slug}`,
        active: true,
        order: i,
      }));
  } catch {
    return [];
  }
}
