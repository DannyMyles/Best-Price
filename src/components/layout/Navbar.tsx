"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCategories } from "@/hooks/useCategories";
import { LogoFull } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { itemCount, openCart } = useCart();
  const { categories } = useCategories();
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-muted/95 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <LogoFull className="h-14 w-auto sm:h-16" />
        </Link>

        {/* Home -> Products -> Categories -> Contact -> Cart */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}

          <div className="group relative">
            <button className="text-sm font-medium text-ink/70 transition-colors hover:text-ink">
              Categories
            </button>
            <div className="invisible absolute left-1/2 top-full z-20 w-64 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-white p-2 shadow-xl shadow-black/10">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    className="rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-surface-muted hover:text-brand"
                  >
                    {c.shortName}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/contact"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Contact
          </Link>

          <button
            onClick={openCart}
            className="relative flex items-center gap-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center sm:flex">
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <motion.form
                  key="search"
                  onSubmit={handleSearch}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => !query && setSearchOpen(false)}
                    placeholder="Search products…"
                    className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-brand/60"
                  />
                </motion.form>
              ) : null}
            </AnimatePresence>
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-white hover:text-ink"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <button
            aria-label="Open cart"
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-white hover:text-ink md:hidden"
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-white md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-surface-muted md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <form onSubmit={handleSearch} className="mb-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand/60"
                />
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-white hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-1 border-t border-border pt-2">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  Categories
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/products?category=${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-white hover:text-ink"
                      )}
                    >
                      {c.shortName}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-lg border-t border-border px-3 py-2.5 pt-3.5 text-sm font-medium text-ink/80 hover:bg-white hover:text-ink"
              >
                Contact
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openCart();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink/80 hover:bg-white hover:text-ink"
              >
                <ShoppingCart className="h-4 w-4" /> Cart
                {itemCount > 0 && (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
