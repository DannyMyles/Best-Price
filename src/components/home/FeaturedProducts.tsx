"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function FeaturedProducts() {
  const { products } = useProducts();
  const featured = products.filter((p) => p.badge || p.featured).slice(0, 8);
  const list = featured.length >= 4 ? featured : products.slice(0, 8);

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <ScrollReveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Popular picks, handpicked for you
            </p>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {list.map((product, i) => (
          <ScrollReveal key={product.sku} delay={Math.min(i * 0.05, 0.3)}>
            <ProductCard product={product} />
          </ScrollReveal>
        ))}
      </div>

      <div className="mt-8 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm font-medium text-ink"
        >
          View all products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
