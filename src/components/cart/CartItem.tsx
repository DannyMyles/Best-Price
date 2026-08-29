"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Bookmark } from "lucide-react";
import { CartLine, useCart } from "@/context/CartContext";
import { formatKES } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";

export function CartItem({
  line,
  compact = false,
}: {
  line: CartLine;
  compact?: boolean;
}) {
  const { updateQuantity, removeItem, saveForLater } = useCart();
  const lineTotal = (line.price ?? 0) * line.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 overflow-hidden py-4"
    >
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

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${line.slug}`}
              className="line-clamp-2 text-sm font-medium text-ink hover:underline"
            >
              {line.name}
            </Link>
            {line.color && (
              <p className="mt-0.5 text-xs text-muted">{line.color}</p>
            )}
            <p className="mt-0.5 text-xs text-muted">
              {line.price === null ? "Price on request" : formatKES(line.price)} each
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-ink">
            {line.price === null ? "POA" : formatKES(lineTotal)}
          </span>
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
            <span className="w-7 text-center text-xs font-semibold tabular-nums">
              {line.quantity}
            </span>
            <button
              aria-label="Increase quantity"
              onClick={() => updateQuantity(line.sku, line.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center text-ink/60 hover:text-ink"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {!compact && (
              <button
                onClick={() => saveForLater(line.sku)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-brand"
              >
                <Bookmark className="h-3.5 w-3.5" /> Save
              </button>
            )}
            <button
              aria-label="Remove item"
              onClick={() => removeItem(line.sku)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-050 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
