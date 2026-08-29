"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, Smartphone } from "lucide-react";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { CategoryChips } from "./CategoryChips";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55rem 32rem at 50% -20%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 70%)",
        }}
      />

      <div className="section relative py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
            The best way to buy the tech you love.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted">
            MacBooks, iPads, iMacs and Surface devices — warrantied, delivered
            countrywide, and paid for with M-Pesa.
          </p>

          <div className="mx-auto mt-7 max-w-xl">
            <SearchAutocomplete size="lg" />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-14"
        >
          <CategoryChips />
        </motion.div>
      </div>
    </section>
  );
}
