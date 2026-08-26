"use client";

import { categories } from "@/lib/data/categories";
import { cn } from "@/lib/cn";

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

export function FilterPanel({
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
}: {
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            !activeCategory
              ? "border-brand bg-brand text-white"
              : "border-border bg-surface text-ink/70 hover:border-brand/40"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => onCategoryChange(c.slug)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === c.slug
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-ink/70 hover:border-ink/30"
            )}
          >
            {c.shortName}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="shrink-0 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink outline-none focus:border-brand/50"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
