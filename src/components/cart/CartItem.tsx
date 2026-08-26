"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartLine, useCart } from "@/context/CartContext";
import { formatKES } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";

export function CartItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const { updateQuantity, removeItem } = useCart();
  const lineTotal = (line.price ?? 0) * line.quantity;

  return (
    <div className="flex gap-3 py-4">
      <Link
        href={`/products/${line.slug}`}
        className="shrink-0 overflow-hidden rounded-lg"
      >
        <ProductImage
          src={line.image}
          category={line.category ?? "accessories"}
          alt={line.name}
          className={compact ? "h-16 w-16 rounded-lg" : "h-20 w-20 rounded-lg"}
          iconClassName={compact ? "h-7 w-7" : "h-9 w-9"}
          sizes={compact ? "64px" : "80px"}
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${line.slug}`}
            className="text-sm font-medium text-ink hover:underline"
          >
            {line.name}
          </Link>
          {line.color && <p className="mt-0.5 text-xs text-muted">{line.color}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-full border border-border">
            <button
              aria-label="Decrease quantity"
              onClick={() => updateQuantity(line.sku, line.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center text-ink/60 hover:text-ink"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-medium">{line.quantity}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => updateQuantity(line.sku, line.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center text-ink/60 hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold text-ink">
            {line.price === null ? "POA" : formatKES(lineTotal)}
          </span>
        </div>
      </div>

      <button
        aria-label="Remove item"
        onClick={() => removeItem(line.sku)}
        className="self-start text-muted transition-colors hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
