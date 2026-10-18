import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bally Digital Solutions — Electronics in Kenya",
    short_name: "Bally",
    description:
      "Genuine laptops, phones, tablets, cameras, TVs, audio and accessories at honest prices. Secure M-Pesa payment, countrywide delivery.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1a3d8c",
    lang: "en-KE",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/brand/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
