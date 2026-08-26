import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrustBadges } from "@/components/home/TrustBadges";
import { VisitStrip } from "@/components/home/VisitStrip";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="pb-16 sm:pb-20">
        <TrustBadges />
      </div>

      <section id="categories" className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
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
