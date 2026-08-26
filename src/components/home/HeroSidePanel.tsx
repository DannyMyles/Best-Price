"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Tablet,
  Laptop,
  Monitor,
  Puzzle,
  Cpu,
  LucideIcon,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const iconMap: Record<string, LucideIcon> = {
  tablet: Tablet,
  laptop: Laptop,
  monitor: Monitor,
  puzzle: Puzzle,
  cpu: Cpu,
};

export function HeroSidePanel() {
  const { categories } = useCategories();

  return (
    <div className="flex h-full flex-col gap-4">
      <Link href="/products?category=imac" className="group block">
        <div className="relative h-44 overflow-hidden rounded-3xl bg-surface-muted sm:h-[260px] lg:h-[300px]">
          <Image
            src="https://images.unsplash.com/photo-1483388147740-e5c70536042e?q=80&w=1200&auto=format&fit=crop"
            alt="iMac"
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">
              New
            </span>
            <p className="mt-2 text-lg font-semibold text-white">24&quot; iMac M4</p>
            <p className="text-xs text-white/70">All-in-one. All speed.</p>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col rounded-3xl border border-border bg-surface p-4">
        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Quick Categories
        </p>
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          {categories.map((c, i) => {
            const Icon = iconMap[c.icon];
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
              >
                <Link
                  href={`/products?category=${c.slug}`}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-muted"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink/80 group-hover:text-ink">
                    {c.name}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 text-muted opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
