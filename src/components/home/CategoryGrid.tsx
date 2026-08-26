"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tablet, Laptop, Monitor, Puzzle, Cpu, LucideIcon, ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const iconMap: Record<string, LucideIcon> = {
  tablet: Tablet,
  laptop: Laptop,
  monitor: Monitor,
  puzzle: Puzzle,
  cpu: Cpu,
};

export function CategoryGrid() {
  const { categories } = useCategories();
  const { products } = useProducts();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {categories.map((category, i) => {
        const Icon = iconMap[category.icon];
        const count = products.filter((p) => p.category === category.slug).length;
        return (
          <ScrollReveal key={category.slug} delay={i * 0.05}>
            <Link href={`/products?category=${category.slug}`}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted text-ink transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <ArrowRight className="h-4 w-4 -translate-x-1 text-brand opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-ink">{category.name}</h3>
                  <p className="mt-0.5 text-xs text-muted">{count} products</p>
                </div>
              </motion.div>
            </Link>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
