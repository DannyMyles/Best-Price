"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { searchProducts } from "@/services/productService";
import { formatKES } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { products } = useProducts();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(
    () => (query.trim() ? searchProducts(products, query).slice(0, 5) : []),
    [products, query]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search MacBook, iPad, iMac, Surface…"
          className="w-full rounded-full border border-border bg-white py-4 pl-13 pr-28 text-sm shadow-sm outline-none ring-brand/15 transition-all focus:border-brand/60 focus:shadow-lg focus:ring-4 sm:text-base"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand/90"
        >
          Search
        </motion.button>
      </form>

      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-black/10"
          >
            {matches.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">
                No products match &ldquo;{query}&rdquo;
              </p>
            ) : (
              <>
                <ul>
                  {matches.map((product) => (
                    <li key={product.sku}>
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted"
                      >
                        <ProductImage
                          src={product.images?.[0]}
                          category={product.category}
                          alt={product.name}
                          className="h-11 w-11 shrink-0 rounded-lg"
                          iconClassName="h-5 w-5"
                          sizes="44px"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted capitalize">
                            {product.category.replace("-", " ")}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-ink">
                          {formatKES(product.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/products?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 border-t border-border py-3 text-sm font-medium text-brand transition-colors hover:bg-surface-muted"
                >
                  View all results <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
