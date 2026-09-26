"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Check,
  Heart,
  Eye,
  MessageCircle,
  GitCompareArrows,
} from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useToast } from "@/context/ToastContext";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { cn } from "@/lib/cn";
import { getProductBadges, isOutOfStock } from "@/lib/badges";
import { whatsappLink } from "@/lib/contact";

export function ProductCard({
  product,
  onQuickView,
  priority = false,
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const { toggle, isSaved } = useWishlist();
  const {
    has: inCompare,
    toggle: toggleCompare,
    isFull: compareFull,
  } = useCompare();
  const { push } = useToast();
  const [added, setAdded] = useState(false);
  const [pop, setPop] = useState(false);
  const saved = isSaved(product.slug);
  const comparing = inCompare(product.sku);
  const badges = getProductBadges(product);
  const soldOut = isOutOfStock(product);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    push({
      type: "success",
      message: `${product.name} added to cart`,
      action: { label: "View cart", href: "/cart" },
    });
    setTimeout(() => setAdded(false), 1500);
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.slug);
    setPop(true);
    setTimeout(() => setPop(false), 320);
    push({
      type: saved ? "info" : "success",
      message: saved ? "Removed from wishlist" : "Saved to wishlist",
    });
  }

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  }

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!comparing && compareFull) {
      push({ type: "info", message: "Compare holds up to 4 products" });
      return;
    }
    toggleCompare(product.sku);
    push({
      type: comparing ? "info" : "success",
      message: comparing ? "Removed from compare" : "Added to compare",
      action: comparing ? undefined : { label: "Compare now", href: "/compare" },
    });
  }

  return (
    <div className="chamfer card-hover group relative flex h-full flex-col overflow-hidden border border-border bg-surface transition-colors hover:border-accent/40">
      <Link href={`/products/${product.slug}`} className="flex h-full flex-col">
        <div className="relative overflow-hidden bg-white">
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            {badges.map((b) => (
              <Badge key={b} variant={b} />
            ))}
          </div>

          <button
            onClick={handleToggleWishlist}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
            className={cn(
              "absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors",
              saved
                ? "bg-brand text-white"
                : "bg-white/85 text-ink/60 hover:text-brand",
              pop && "animate-pop"
            )}
          >
            <Heart
              className="h-4 w-4"
              fill={saved ? "currentColor" : "none"}
              strokeWidth={1.8}
            />
          </button>

          <button
            onClick={handleCompare}
            aria-label={comparing ? "Remove from compare" : "Add to compare"}
            aria-pressed={comparing}
            className={cn(
              "absolute right-3 top-12 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-[color,background-color,opacity]",
              // Hover-only on mouse devices; always visible on touch screens.
              !comparing && "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100",
              comparing
                ? "bg-brand text-white"
                : "bg-white/85 text-ink/60 hover:text-brand"
            )}
          >
            <GitCompareArrows className="h-4 w-4" strokeWidth={1.8} />
          </button>

          <div className="aspect-square">
            <ProductImage
              src={product.images?.[0]}
              category={product.category}
              alt={product.name}
              priority={priority}
              fit="contain"
              className={cn(
                "h-full w-full p-4 transition-transform duration-500 group-hover:scale-[1.04] sm:p-5",
                soldOut && "opacity-60"
              )}
              iconClassName="h-16 w-16 sm:h-20 sm:w-20"
            />
          </div>

          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="absolute inset-x-3 bottom-3 z-10 flex translate-y-2 items-center justify-center gap-1.5 rounded-full bg-white/95 py-2 text-xs font-semibold text-ink opacity-0 shadow-md backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Eye className="h-3.5 w-3.5" /> Quick view
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 border-t border-border/70 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
            {product.brand || product.category.replace(/-/g, " ")}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
            {product.name}
          </h3>
          {product.rating != null && (
            <Rating value={product.rating} count={product.reviewCount} />
          )}
          <div className="mt-auto pt-1">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
            <StockLine product={product} soldOut={soldOut} />
          </div>

          {soldOut ? (
            <a
              href={whatsappLink(
                `Hi PriceHub, is "${product.name}" back in stock?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-border py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:border-brand/50 hover:text-brand"
            >
              <MessageCircle className="h-4 w-4" /> Notify me
            </a>
          ) : (
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border py-2.5 text-sm font-semibold transition-colors",
                added
                  ? "border-success bg-success text-white"
                  : "border-brand text-brand hover:bg-brand hover:text-brand-foreground"
              )}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add to Cart
                </>
              )}
            </motion.button>
          )}
        </div>
      </Link>
    </div>
  );
}

/** One quiet line under the price: in stock / only N left / out of stock. */
function StockLine({ product, soldOut }: { product: Product; soldOut: boolean }) {
  const few = !soldOut && product.stockCount != null && product.stockCount > 0 && product.stockCount <= 3;
  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-1.5 text-xs",
        soldOut || !few ? "text-muted" : "text-warning"
      )}
    >
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 rounded-full", soldOut ? "bg-muted" : few ? "bg-warning" : "bg-accent")}
      />
      {soldOut ? "Out of stock" : few ? `Only ${product.stockCount} left` : "In stock"}
    </p>
  );
}
