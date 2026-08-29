import { Suspense } from "react";
import { Metadata } from "next";
import { ProductsView } from "./ProductsView";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse laptops, phones, tablets, cameras, camera lenses, TVs, audio and accessories at honest prices, with secure M-Pesa payment and countrywide delivery.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "All Products · PriceHub",
    description:
      "Laptops, phones, cameras, TVs, audio and more — genuine stock, honest prices, delivered across Kenya.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}
