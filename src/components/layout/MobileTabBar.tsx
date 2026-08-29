"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LayoutGrid, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { cn } from "@/lib/cn";

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const item =
    "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium";

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-[45] border-t border-border bg-surface/95 pb-safe backdrop-blur-lg lg:hidden"
      >
        <div className="flex items-stretch">
          <Link
            href="/"
            className={cn(item, isActive("/") ? "text-brand" : "text-muted")}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(item, "text-muted")}
          >
            <Search className="h-5 w-5" />
            Search
          </button>
          <Link
            href="/products"
            className={cn(
              item,
              isActive("/products") ? "text-brand" : "text-muted"
            )}
          >
            <LayoutGrid className="h-5 w-5" />
            Shop
          </Link>
          <Link
            href="/wishlist"
            className={cn(
              item,
              isActive("/wishlist") ? "text-brand" : "text-muted"
            )}
          >
            <span className="relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </span>
            Saved
          </Link>
          <button onClick={openCart} className={cn(item, "text-muted")}>
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </span>
            Cart
          </button>
        </div>
      </nav>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
