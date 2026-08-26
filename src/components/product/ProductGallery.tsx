"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!zoomOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen, images.length]);

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
        <button
          onClick={() => setZoomOpen(true)}
          aria-label="Zoom product image"
          className="group relative block w-full cursor-zoom-in"
        >
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
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-4.5 w-4.5" />
          </span>
        </button>
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

      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10"
          >
            <button
              aria-label="Close"
              onClick={() => setZoomOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((i) => (i - 1 + images.length) % images.length);
                  }}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive((i) => (i + 1) % images.length);
                  }}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-full max-h-[85vh] w-full max-w-2xl"
            >
              <ProductImage
                src={images[active]}
                category={product.category}
                alt={product.name}
                className="h-full w-full rounded-2xl"
                sizes="90vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
