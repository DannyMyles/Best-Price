"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Smartphone, Star } from "lucide-react";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { ProductImage } from "@/components/ui/ProductImage";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useMounted } from "@/hooks/useMounted";
import type { Product } from "@/lib/types";

function pickFeatured(products: Product[]): Product | null {
  return (
    products.find(
      (p) => p.badge === "Best Seller" && (p.images?.length ?? 0) > 0
    ) ??
    products.find((p) => p.featured && (p.images?.length ?? 0) > 0) ??
    products.find((p) => (p.images?.length ?? 0) > 0 && p.price !== null) ??
    products[0] ??
    null
  );
}

export function Hero() {
  const { products } = useProducts();
  const mounted = useMounted();
  const featured = mounted ? pickFeatured(products) : null;

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      {/* premium ambient wash — one soft, calm gradient, no floaty blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 40rem at 8% -10%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 70%), radial-gradient(50rem 40rem at 108% 10%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 70%)",
        }}
      />

      <div className="section relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-20">
        {/* Left: message + search + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink/70 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Genuine tech · Secure M-Pesa · Kenya-wide delivery
          </span>

          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
            The tech you want,
            <br />
            <span className="text-brand">at the best price.</span>
          </h1>

          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted">
            MacBooks, iPads, iMacs and Surface devices — warrantied, delivered
            countrywide, and paid for the way Kenya pays.
          </p>

          <div className="mt-6">
            <SearchAutocomplete />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary px-6 py-3">
              Shop all products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#categories" className="btn-secondary px-6 py-3">
              Shop by category
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" /> Genuine &amp;
              warrantied
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-success" /> Secure M-Pesa
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-success" /> 2–5 day delivery
            </span>
          </div>
        </motion.div>

        {/* Right: one featured product, presented as a premium card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:mx-0"
        >
          {/* depth: faint card peeking behind */}
          <div className="absolute -right-3 -top-3 hidden h-full w-full rounded-3xl border border-border bg-surface/60 sm:block" />

          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
            <div className="relative aspect-[4/3] bg-surface-muted">
              {featured ? (
                <>
                  <ProductImage
                    src={featured.images?.[0]}
                    category={featured.category}
                    alt={featured.name}
                    priority
                    className="h-full w-full"
                    iconClassName="h-20 w-20"
                    sizes="(min-width: 1024px) 32vw, 90vw"
                  />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-panel-dark px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </span>
                </>
              ) : (
                <Skeleton className="absolute inset-0 rounded-none" />
              )}
            </div>

            <div className="p-5">
              {featured ? (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                    {featured.category.replace(/-/g, " ")}
                  </p>
                  <h2 className="mt-1 line-clamp-1 text-base font-semibold text-ink">
                    {featured.name}
                  </h2>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <Price
                      price={featured.price}
                      compareAtPrice={featured.compareAtPrice}
                    />
                    <Rating
                      value={featured.rating ?? 4.8}
                      count={featured.reviewCount}
                    />
                  </div>
                  <Link
                    href={`/products/${featured.slug}`}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                  >
                    View details <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="mt-3 h-10 w-full rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* floating reassurance chip */}
          <div className="absolute -bottom-4 left-6 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2 shadow-lg">
            <Truck className="h-4 w-4 text-success" />
            <span className="text-xs font-medium text-ink">
              Free Nairobi CBD pickup
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
