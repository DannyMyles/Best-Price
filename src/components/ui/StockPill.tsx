import { Check, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";
import { isOutOfStock } from "@/lib/badges";

export function StockPill({
  product,
  className,
}: {
  product: Pick<Product, "inStock" | "stockCount">;
  className?: string;
}) {
  const out = isOutOfStock(product as Product);
  const low =
    !out &&
    typeof product.stockCount === "number" &&
    product.stockCount > 0 &&
    product.stockCount <= 3;

  if (out) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium text-muted",
          className
        )}
      >
        <XCircle className="h-3.5 w-3.5" /> Out of stock
      </span>
    );
  }

  if (low) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold text-warning",
          className
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Low stock — {product.stockCount} left
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium text-success",
        className
      )}
    >
      <Check className="h-3.5 w-3.5" /> In stock
    </span>
  );
}
