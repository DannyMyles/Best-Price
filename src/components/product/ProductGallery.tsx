"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { TiltCard } from "@/components/ui/TiltCard";
import { getCategoryImages } from "@/lib/data/categoryImages";
import { cn } from "@/lib/cn";
import { badgeStyles } from "@/lib/badges";

export function ProductGallery({ product }: { product: Product }) {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : getCategoryImages(product.category);
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative">
        {product.badge && (
          <span
            className={cn(
              "absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold",
              badgeStyles[product.badge]
            )}
          >
            {product.badge}
          </span>
        )}
        <TiltCard maxTilt={4} className="aspect-square w-full">
          <ProductImage
            src={images[active]}
            category={product.category}
            alt={product.name}
            className="h-full w-full rounded-3xl"
            iconClassName="h-28 w-28 sm:h-36 sm:w-36"
            sizes="(min-width: 1024px) 45vw, 90vw"
            priority
          />
        </TiltCard>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                active === i ? "border-brand" : "border-transparent"
              )}
            >
              <ProductImage
                src={src}
                category={product.category}
                alt={`${product.name} view ${i + 1}`}
                className="h-full w-full"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
