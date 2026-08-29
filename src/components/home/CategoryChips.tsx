"use client";

import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryImages } from "@/lib/data/categoryImages";

/** Apple-Store-style quick links: a light rounded tile per category with a
 *  representative image and a short label. Scrolls on mobile, centres on
 *  desktop. */
export function CategoryChips() {
  const { categories } = useCategories();

  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-5 sm:overflow-visible sm:px-0">
      {categories.map((c) => {
        const img = getCategoryImages(c.slug)[0];
        return (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2.5 sm:w-28"
          >
            <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-surface-muted transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-md sm:h-28 sm:w-28">
              {img && (
                <Image
                  src={img}
                  alt={c.name}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              )}
            </span>
            <span className="text-center text-xs font-medium text-ink/80 group-hover:text-brand">
              {c.shortName}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
