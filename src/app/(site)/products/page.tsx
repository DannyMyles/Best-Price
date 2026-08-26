import { Suspense } from "react";
import { Metadata } from "next";
import { ProductsView } from "./ProductsView";

export const metadata: Metadata = {
  title: "Products — BestPrice Technologies",
  description: "Browse MacBooks, iPads, iMacs, Surface devices and accessories.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}
