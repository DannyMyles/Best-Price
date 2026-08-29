"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ShoppingCart, ChevronDown, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCategories } from "@/hooks/useCategories";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { LogoFull } from "@/components/ui/Logo";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { formatKES } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, openCart, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { categories } = useCategories();
  const pathname = usePathname();
  const menuRef = useFocusTrap<HTMLDivElement>(mobileOpen, () => setMobileOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close overlays after a route change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-surface/95 backdrop-blur-lg transition-shadow",
          scrolled ? "border-border shadow-sm" : "border-transparent"
        )}
      >
        <div className="section flex h-16 items-center gap-4 lg:h-[72px]">
          <Link
            href="/"
            aria-label="PriceHub home"
            className="shrink-0 text-panel-dark"
          >
            <LogoFull className="text-[1.15rem] sm:text-[1.35rem]" />
          </Link>

          {/* Desktop search — always visible, the single search on the site */}
          <div className="hidden min-w-0 flex-1 lg:block">
            <SearchAutocomplete className="mx-auto max-w-xl" />
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <div
              className="relative py-4"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold transition-colors",
                  categoriesOpen ? "text-brand" : "text-ink/75 hover:text-ink"
                )}
                aria-expanded={categoriesOpen}
              >
                Categories
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    categoriesOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full w-72 pt-2"
                  >
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/products?category=${c.slug}`}
                          className="block rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-surface-muted hover:text-brand"
                        >
                          {c.name}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        className="mt-1 block rounded-lg border-t border-border px-3 py-2 pt-3 text-sm font-semibold text-brand hover:bg-surface-muted"
                      >
                        View all products →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/contact"
              className={cn(
                "text-sm font-semibold transition-colors",
                isActive("/contact") ? "text-brand" : "text-ink/75 hover:text-ink"
              )}
            >
              Contact
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="flex items-center gap-2 rounded-full border border-border py-2 pl-3 pr-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
            >
              <span className="relative">
                <ShoppingCart className="h-4.5 w-4.5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-2 -top-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="tabular-nums">
                {itemCount > 0 ? formatKES(subtotal) : "Cart"}
              </span>
            </button>
          </nav>

          {/* Mobile actions */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              aria-label="Open cart"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-surface-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile slide-over menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed right-0 top-0 z-[60] flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <span className="text-panel-dark">
                  <LogoFull className="text-[1.2rem]" />
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-surface-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <Link
                  href="/products"
                  className="block rounded-xl bg-brand-050 px-4 py-3 text-sm font-semibold text-brand"
                >
                  Shop all products
                </Link>
                <p className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Categories
                </p>
                <div className="flex flex-col">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/products?category=${c.slug}`}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted hover:text-brand"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <Link
                    href="/contact"
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted"
                  >
                    Contact
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted"
                  >
                    Wishlist{wishlistCount > 0 && ` (${wishlistCount})`}
                  </Link>
                  <Link
                    href="/faqs"
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-surface-muted"
                  >
                    Help &amp; FAQs
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
