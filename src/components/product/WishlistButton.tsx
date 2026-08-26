"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/cn";

export function WishlistButton({ slug }: { slug: string }) {
  const { toggle, isSaved } = useWishlist();
  const saved = isSaved(slug);

  return (
    <button
      onClick={() => toggle(slug)}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
        saved
          ? "border-brand bg-brand/10 text-brand"
          : "border-border text-ink/60 hover:border-brand/40 hover:text-brand"
      )}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <Heart className="h-4.5 w-4.5" fill={saved ? "currentColor" : "none"} strokeWidth={1.8} />
    </button>
  );
}
