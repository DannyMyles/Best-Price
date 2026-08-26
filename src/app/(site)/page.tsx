import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { VisitStrip } from "@/components/home/VisitStrip";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Home() {
  return (
    <>
      <Hero />

      <section id="categories" className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Find exactly what you&apos;re looking for
            </p>
          </div>
        </ScrollReveal>
        <CategoryGrid />
      </section>

      <FeaturedProducts />
      <VisitStrip />
    </>
  );
}
