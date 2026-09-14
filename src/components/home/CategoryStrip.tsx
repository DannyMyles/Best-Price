"use client";

import { motion } from "framer-motion";
import { CategoryChips } from "./CategoryChips";

/** Sits just below the promo carousel — a mono eyebrow, a thin circuit-trace
 *  rule (the same signature line used in the hero), and a row of category
 *  quick-links, so shoppers can jump straight to a department without
 *  waiting for a slide to match what they want. */
export function CategoryStrip() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="section relative py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 flex items-center gap-3 sm:mb-8">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {"// Shop by department"}
            </span>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <CategoryChips />
        </motion.div>
      </div>
    </section>
  );
}
