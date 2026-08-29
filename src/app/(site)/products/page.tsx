import { Suspense } from "react";
import { Metadata } from "next";
import { ProductsView } from "./ProductsView";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse MacBooks, iPads, iMacs, Surface devices and accessories at honest prices, with secure M-Pesa payment and countrywide delivery.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}
