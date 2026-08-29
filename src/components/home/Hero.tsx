"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Smartphone } from "lucide-react";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { HeroCarousel } from "./HeroCarousel";
import { useCategories } from "@/hooks/useCategories";

export function Hero() {
  const { categories } = useCategories();

  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-050/70 to-background">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-float-slower" />

      <div className="section relative pt-10 sm:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Genuine tech · honest prices · Kenya-wide
          </p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            The best price on the tech you want
          </h1>
          <p className="mt-3 text-pretty text-sm text-muted sm:text-base">
            MacBooks, iPads, iMacs and Surface devices — paid securely on M-Pesa,
            delivered across the country.
          </p>

          <div className="mt-6">
            <SearchAutocomplete className="mx-auto max-w-xl" />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${c.slug}`}
                className="chip hover:border-brand/50 hover:text-brand"
              >
                {c.shortName}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Genuine &amp;
              warrantied
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-success" /> Secure M-Pesa
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-success" /> Countrywide delivery
            </span>
          </div>
        </motion.div>
      </div>

      <div className="section relative py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroCarousel />
        </motion.div>
      </div>
    </section>
  );
}
