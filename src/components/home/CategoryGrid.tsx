"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tablet, Laptop, Monitor, Puzzle, Cpu, LucideIcon, ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { getCategoryImages } from "@/lib/data/categoryImages";
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
        const image = getCategoryImages(category.slug)[0];

        return (
          <ScrollReveal key={category.slug} delay={i * 0.05}>
            <Link href={`/products?category=${category.slug}`}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-muted shadow-sm"
              >
                {image && (
                  <Image
                    src={image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5 transition-colors group-hover:from-black/85" />

                <div className="absolute inset-x-3 top-3 flex items-start justify-between sm:inset-x-4 sm:top-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={1.7} />
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-md transition-all group-hover:opacity-100 sm:h-10 sm:w-10">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
                  <h3 className="text-base font-semibold text-white sm:text-lg">
                    {category.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/70">{count} products</p>
                </div>
              </motion.div>
            </Link>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
