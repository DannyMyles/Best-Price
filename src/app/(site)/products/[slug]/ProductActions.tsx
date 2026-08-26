"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { formatKES } from "@/lib/format";

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [inView, setInView] = useState(true);
  const anchorRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/checkout");
  }

  return (
    <div ref={anchorRef} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink/70">Quantity</span>
        <div className="flex items-center rounded-full border border-border">
          <button
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-ink/60 hover:text-ink"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
          <button
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex h-10 w-10 items-center justify-center text-ink/60 hover:text-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <AnimatedButton
          variant={added ? "primary" : "secondary"}
          onClick={handleAdd}
          className="flex-1"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added to Cart
            </>
          ) : (
            "Add to Cart"
          )}
        </AnimatedButton>
        <AnimatedButton variant="dark" onClick={handleBuyNow} className="flex-1">
          Buy Now
        </AnimatedButton>
      </div>

      <AnimatePresence>
        {!inView && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink/70">{product.name}</p>
              <p className="text-sm font-semibold text-ink">{formatKES(product.price)}</p>
            </div>
            <button
              onClick={handleAdd}
              className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              {added ? "Added" : "Add to Cart"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
