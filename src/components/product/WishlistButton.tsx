"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/cn";

export function WishlistButton({
  slug,
  withLabel = false,
}: {
  slug: string;
  withLabel?: boolean;
}) {
  const { toggle, isSaved } = useWishlist();
  const { push } = useToast();
  const saved = isSaved(slug);
  const [pop, setPop] = useState(false);

  function handleClick() {
    toggle(slug);
    setPop(true);
    setTimeout(() => setPop(false), 320);
    push({
      type: saved ? "info" : "success",
      message: saved ? "Removed from wishlist" : "Saved to wishlist",
    });
  }

  if (withLabel) {
    return (
      <button
        onClick={handleClick}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
          saved
            ? "border-brand bg-brand-050 text-brand"
            : "border-border text-ink/70 hover:border-brand/40 hover:text-brand"
        )}
      >
        <Heart
          className={cn("h-4 w-4", pop && "animate-pop")}
          fill={saved ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
        saved
          ? "border-brand bg-brand-050 text-brand"
          : "border-border text-ink/60 hover:border-brand/40 hover:text-brand"
      )}
    >
      <Heart
        className={cn("h-4.5 w-4.5", pop && "animate-pop")}
        fill={saved ? "currentColor" : "none"}
        strokeWidth={1.8}
      />
    </button>
  );
}
