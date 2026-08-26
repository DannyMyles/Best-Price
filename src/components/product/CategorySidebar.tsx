"use client";

import { Tablet, Laptop, Monitor, Puzzle, Cpu, LucideIcon, Grid2x2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/cn";

const iconMap: Record<string, LucideIcon> = {
  tablet: Tablet,
  laptop: Laptop,
  monitor: Monitor,
  puzzle: Puzzle,
  cpu: Cpu,
};

export function CategorySidebar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}) {
  const { categories } = useCategories();
  const { products } = useProducts();

  return (
    <nav className="hidden w-56 shrink-0 lg:block">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Shop by Category
      </p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
            !activeCategory
              ? "bg-brand/10 text-brand"
              : "text-ink/75 hover:bg-surface-muted hover:text-ink"
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              !activeCategory ? "bg-brand text-white" : "bg-surface-muted text-ink/60"
            )}
          >
            <Grid2x2 className="h-4 w-4" strokeWidth={1.7} />
          </span>
          All Products
          <span className="ml-auto text-xs text-muted">{products.length}</span>
        </button>

        {categories.map((c) => {
          const Icon = iconMap[c.icon];
          const count = products.filter((p) => p.category === c.slug).length;
          const active = activeCategory === c.slug;
          return (
            <button
              key={c.slug}
              onClick={() => onCategoryChange(c.slug)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                active ? "bg-brand/10 text-brand" : "text-ink/75 hover:bg-surface-muted hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  active ? "bg-brand text-white" : "bg-surface-muted text-ink/60"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.7} />
              </span>
              {c.name}
              <span className="ml-auto text-xs text-muted">{count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
