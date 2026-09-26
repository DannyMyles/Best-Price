"use client";

import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
import { categoryIconMap, DEFAULT_CATEGORY_ICON } from "@/lib/categoryIcons";

/** Quick category links styled to the chamfered, hairline-bordered shape
 *  language — a small registration-mark tick in the corner, a mono label
 *  underneath, instead of a plain rounded photo tile. Scrolls on mobile,
 *  centres on desktop. */
export function CategoryChips() {
  const { categories, loading } = useCategories();

  if (loading && categories.length === 0) {
    return (
      <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:justify-center sm:gap-5 sm:px-0" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="flex w-24 shrink-0 flex-col items-center gap-2.5 sm:w-28">
            <span className="skeleton chamfer-sm h-24 w-24 sm:h-28 sm:w-28" />
            <span className="skeleton h-3 w-14" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-5 sm:overflow-visible sm:px-0">
      {categories.map((c) => {
        const img = c.image;
        const key = (c.icon || c.slug).toLowerCase();
        const Icon = categoryIconMap[key] ?? categoryIconMap[key.replace(/s$/, "")] ?? DEFAULT_CATEGORY_ICON;
        return (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2.5 sm:w-28"
          >
            <span className="chamfer-sm relative flex h-24 w-24 items-center justify-center overflow-hidden border border-border bg-white transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:border-accent group-hover:shadow-md sm:h-28 sm:w-28">
              <span className="circuit-tick left-2 top-2 z-10 text-accent/70" />
              {!img && <Icon className="h-8 w-8 text-muted" strokeWidth={1.4} />}
              {img && (
                <Image
                  src={img}
                  alt={c.name}
                  width={112}
                  height={112}
                  unoptimized
                  className="h-full w-full object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </span>
            <span className="text-center font-mono text-[11px] uppercase tracking-wide text-ink/70 group-hover:text-accent-strong">
              {c.shortName}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
