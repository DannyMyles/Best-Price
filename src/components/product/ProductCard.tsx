"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/types";
import { formatKES } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { TiltCard } from "@/components/ui/TiltCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/cn";
import { badgeStyles } from "@/lib/badges";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <SpotlightCard className="flex h-full flex-col">
      <Link href={`/products/${product.slug}`} className="flex h-full flex-col">
        <div className="relative">
          {product.badge && (
            <span
              className={cn(
                "absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                badgeStyles[product.badge]
              )}
            >
              {product.badge}
            </span>
          )}
          <TiltCard maxTilt={5} className="aspect-square">
            <ProductImage
              src={product.images?.[0]}
              category={product.category}
              alt={product.name}
              className="h-full w-full rounded-t-2xl"
              iconClassName="h-16 w-16 sm:h-20 sm:w-20"
            />
          </TiltCard>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {product.category.replace("-", " ")}
          </p>
          <h3 className="text-sm font-semibold leading-snug text-ink line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-auto text-base font-semibold text-ink">
            {formatKES(product.price)}
          </p>

          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "mt-1 flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-medium transition-colors",
              added
                ? "bg-success text-white"
                : "bg-brand text-white hover:bg-brand/90"
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
        </div>
      </Link>
    </SpotlightCard>
  );
}
