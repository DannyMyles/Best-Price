"use client";

import { Heart } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useWishlist } from "@/context/WishlistContext";
import { useMounted } from "@/hooks/useMounted";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AnimatedLinkButton } from "@/components/ui/AnimatedButton";

export default function WishlistPage() {
  const { products, loading } = useProducts();
  const { slugs } = useWishlist();
  const mounted = useMounted();
  const saved = products.filter((p) => slugs.includes(p.slug));
  const busy = !mounted || loading;

  return (
    <div className="section py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Your Wishlist
        </h1>
        <p className="mt-1.5 text-sm text-muted" aria-live="polite">
          {busy
            ? "Loading…"
            : `${saved.length} ${saved.length === 1 ? "item" : "items"} saved`}
        </p>
      </div>

      {!busy && saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
            <Heart className="h-7 w-7 text-muted" />
          </div>
          <p className="text-sm font-medium text-ink">Your wishlist is empty</p>
          <p className="max-w-xs text-sm text-muted">
            Tap the heart on any product to save it here for later.
          </p>
          <AnimatedLinkButton href="/products" variant="dark" className="mt-2">
            Browse Products
          </AnimatedLinkButton>
        </div>
      ) : (
        <ProductGrid products={saved} loading={busy} />
      )}
    </div>
  );
}
