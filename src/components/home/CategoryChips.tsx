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
  const { categories } = useCategories();

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
            <span className="chamfer-sm relative flex h-24 w-24 items-center justify-center overflow-hidden border border-border bg-surface-muted transition-[transform,border-color] duration-200 group-hover:-translate-y-1 group-hover:border-accent sm:h-28 sm:w-28">
              <span className="circuit-tick left-2 top-2 z-10 text-accent/70" />
              {!img && <Icon className="h-8 w-8 text-muted" strokeWidth={1.4} />}
              {img && (
                <Image
                  src={img}
                  alt={c.name}
                  width={112}
                  height={112}
                  unoptimized
                  className="h-full w-full object-cover"
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
