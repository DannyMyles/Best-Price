import type { MetadataRoute } from "next";

const base = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pricehub.co.ke"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/cart", "/checkout", "/wishlist"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
