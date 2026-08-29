"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryImages } from "@/lib/data/categoryImages";

/** Which departments to spotlight, in order of preference. The first two
 *  that actually exist in the (live) category list get rendered. */
const PREFERRED = ["laptops", "cameras", "phones", "tvs", "audio"];

const EYEBROWS: Record<string, string> = {
  laptops: "Work. Create. Play.",
  cameras: "Capture more",
  phones: "Everyday essentials",
  tvs: "Bigger picture",
  audio: "Hear the difference",
};

export function PromoBanners() {
  const { categories } = useCategories();

  const picks = PREFERRED.map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 2);

  if (picks.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {picks.map((c, i) => (
          <ScrollReveal key={c.slug} delay={i * 0.1}>
            <Link
              href={`/products?category=${c.slug}`}
              className="group block"
            >
              <div className="relative h-64 overflow-hidden rounded-3xl bg-surface-muted sm:h-72">
                <Image
                  src={getCategoryImages(c.slug)[0]}
                  alt={c.name}
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-r from-panel-dark/90 via-panel-dark/40 to-transparent" />
                <div className="absolute inset-y-0 left-0 flex max-w-xs flex-col justify-center gap-2 px-7 sm:px-9">
                  <span className="text-xs font-medium text-brand-2">
                    {EYEBROWS[c.slug] ?? "Shop the range"}
                  </span>
                  <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                    {c.name}
                  </h3>
                  <p className="text-sm text-white/70">{c.description}</p>
                  <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink transition-transform group-hover:translate-x-1">
                    Shop {c.shortName} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
