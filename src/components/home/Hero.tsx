"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CategoryChips } from "./CategoryChips";
import { InteractiveBackdrop } from "./InteractiveBackdrop";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <InteractiveBackdrop />

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

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/products" className="btn-primary px-6 py-3">
              Shop all products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#categories" className="btn-secondary px-6 py-3">
              Browse categories
            </Link>
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
