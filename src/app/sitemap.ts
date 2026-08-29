import type { MetadataRoute } from "next";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";

const base = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pricehub.co.ke"
).replace(/\/$/, "");

// Rebuild alongside the product ISR window.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}/faqs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/returns`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const categories = await getCategories();
    categoryRoutes = categories.map((c) => ({
      url: `${base}/products?category=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    /* fall back to just the static + product routes */
  }

  try {
    const products = await getProducts();
    productRoutes = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    /* ignore */
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
