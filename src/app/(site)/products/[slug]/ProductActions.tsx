"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Check, Share2 } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { WishlistButton } from "@/components/product/WishlistButton";
import { formatKES } from "@/lib/format";
import { isOutOfStock } from "@/lib/badges";
import { whatsappLink } from "@/lib/contact";

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [inView, setInView] = useState(true);
  const anchorRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { push } = useToast();
  const router = useRouter();
  const soldOut = isOutOfStock(product);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    push({
      type: "success",
      message: `${product.name} added to cart`,
      action: { label: "View cart", href: "/cart" },
    });
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/checkout");
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        push({ type: "success", message: "Link copied to clipboard" });
      }
    } catch {
      /* user cancelled share */
    }
  }

  if (soldOut) {
    return (
      <div ref={anchorRef} className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-surface-muted/50 p-4 text-sm text-muted">
          This item is currently out of stock. Message us and we&apos;ll let you
          know as soon as it&apos;s back.
        </div>
        <a
          href={whatsappLink(`Hi PriceHub, is "${product.name}" back in stock?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-mpesa w-full sm:w-auto"
        >
          Notify me on WhatsApp
        </a>
      </div>
    );
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
          <span className="w-8 text-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>
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

      <div className="flex items-center gap-2">
        <WishlistButton slug={product.slug} withLabel />
        <button
          onClick={handleShare}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-ink/70 transition-colors hover:border-brand/40 hover:text-brand"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      {/* Sticky mobile action bar */}
      <AnimatePresence>
        {!inView && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 bottom-14 z-[46] flex items-center gap-3 border-t border-border bg-surface/98 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink/70">
                {product.name}
              </p>
              <p className="text-sm font-bold text-ink">
                {formatKES(product.price)}
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="shrink-0 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-ink"
            >
              {added ? "Added" : "Add"}
            </button>
            <button
              onClick={handleBuyNow}
              className="shrink-0 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
            >
              Buy Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
