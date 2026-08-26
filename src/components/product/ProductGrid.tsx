import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { PackageSearch } from "lucide-react";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
        <PackageSearch className="h-10 w-10 text-muted" />
        <p className="text-sm font-medium text-ink">No products found</p>
        <p className="max-w-xs text-sm text-muted">
          Try a different search term or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
}
