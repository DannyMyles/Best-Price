"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight, Clock, TrendingUp, X, Tag } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { searchProducts } from "@/services/productService";
import { popularSearches } from "@/lib/data/popularSearches";
import { ProductImage } from "@/components/ui/ProductImage";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/cn";

interface Option {
  key: string;
  href: string;
  render: React.ReactNode;
}

export function SearchAutocomplete({
  variant = "bar",
  size = "md",
  autoFocus = false,
  onNavigate,
  className,
}: {
  variant?: "bar" | "overlay";
  size?: "md" | "lg";
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { recent, record, clear } = useRecentSearches();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(variant === "overlay");
  const [debounced, setDebounced] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 140);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (variant === "overlay") return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [variant]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const productMatches = useMemo(
    () => (debounced ? searchProducts(products, debounced).slice(0, 6) : []),
    [products, debounced]
  );

  const categoryMatches = useMemo(() => {
    if (!debounced) return [];
    const q = debounced.toLowerCase();
    return categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3);
  }, [categories, debounced]);

  function goToSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    record(t);
    setOpen(false);
    onNavigate?.();
    router.push(`/products?q=${encodeURIComponent(t)}`);
  }

  function goTo(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  // Flat option list for keyboard navigation.
  const options: Option[] = useMemo(() => {
    const opts: Option[] = [];
    if (debounced) {
      productMatches.forEach((p) =>
        opts.push({
          key: `p-${p.sku}`,
          href: `/products/${p.slug}`,
          render: (
            <span className="flex min-w-0 items-center gap-3">
              <ProductImage
                src={p.images?.[0]}
                category={p.category}
                alt={p.name}
                className="h-10 w-10 shrink-0 rounded-lg"
                iconClassName="h-4 w-4"
                sizes="40px"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {p.name}
                </span>
                <span className="text-xs capitalize text-muted">
                  {p.category.replace(/-/g, " ")}
                </span>
              </span>
              <span className="shrink-0">
                <Price price={p.price} size="sm" />
              </span>
            </span>
          ),
        })
      );
      categoryMatches.forEach((c) =>
        opts.push({
          key: `c-${c.slug}`,
          href: `/products?category=${c.slug}`,
          render: (
            <span className="flex items-center gap-3 text-sm text-ink">
              <Tag className="h-4 w-4 text-muted" />
              Shop <span className="font-semibold">{c.name}</span>
            </span>
          ),
        })
      );
    }
    return opts;
  }, [debounced, productMatches, categoryMatches]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && options[activeIndex]) {
        e.preventDefault();
        goTo(options[activeIndex].href);
      } else {
        goToSearch(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel = open && (variant === "overlay" || query.length > 0 || recent.length > 0);
  const hasResults = options.length > 0;
  const showPrompts = !debounced;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goToSearch(query);
        }}
        className="relative"
      >
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted",
            size === "lg" ? "left-5 h-5 w-5" : "left-4 h-4.5 w-4.5"
          )}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search MacBook, iPad, Surface…"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className={cn(
            "w-full rounded-full border border-border bg-surface outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10",
            variant === "overlay"
              ? "py-3.5 pl-11 pr-4 text-sm"
              : size === "lg"
                ? "py-4 pl-12 pr-28 text-base shadow-sm"
                : "py-2.5 pl-11 pr-24 text-sm"
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted hover:text-ink",
              variant === "overlay" ? "right-4" : "right-[4.75rem]"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {variant === "bar" && (
          <button
            type="submit"
            className={cn(
              "absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-strong",
              size === "lg" ? "px-5 py-2.5" : "px-4 py-1.5"
            )}
          >
            Search
          </button>
        )}
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "z-30 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl",
              variant === "overlay"
                ? "mt-3"
                : "absolute left-0 right-0 top-full mt-2"
            )}
          >
            {showPrompts ? (
              <div className="p-2">
                {recent.length > 0 && (
                  <div className="mb-1">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        <Clock className="h-3.5 w-3.5" /> Recent
                      </span>
                      <button
                        onClick={clear}
                        className="text-[11px] font-medium text-brand hover:text-brand-strong"
                      >
                        Clear
                      </button>
                    </div>
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => goToSearch(term)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink/80 hover:bg-surface-muted"
                      >
                        <Search className="h-3.5 w-3.5 text-muted" />
                        {term}
                      </button>
                    ))}
                  </div>
                )}
                <span className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <TrendingUp className="h-3.5 w-3.5" /> Popular
                </span>
                <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => goToSearch(term)}
                      className="chip hover:border-brand/50 hover:text-brand"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : hasResults ? (
              <>
                <ul className="max-h-[60vh] overflow-y-auto py-1">
                  {options.map((opt, i) => (
                    <li key={opt.key} role="option" aria-selected={i === activeIndex}>
                      <Link
                        href={opt.href}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => {
                          setOpen(false);
                          onNavigate?.();
                          record(debounced);
                        }}
                        className={cn(
                          "block px-3 py-2.5 transition-colors",
                          i === activeIndex ? "bg-surface-muted" : "hover:bg-surface-muted"
                        )}
                      >
                        {opt.render}
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => goToSearch(query)}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-border py-3 text-sm font-semibold text-brand hover:bg-surface-muted"
                >
                  See all results for “{query}” <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-sm font-medium text-ink">
                  No matches for “{query}”
                </p>
                <p className="mt-1 text-xs text-muted">
                  Check the spelling or browse a category instead.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {categories.slice(0, 4).map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => goTo(`/products?category=${c.slug}`)}
                      className="chip hover:border-brand/50 hover:text-brand"
                    >
                      {c.shortName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
