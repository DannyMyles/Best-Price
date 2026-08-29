import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HomeRails } from "@/components/home/HomeRails";
import { TrustBadges } from "@/components/home/TrustBadges";
import { PromoBanners } from "@/components/home/PromoBanners";
import { VisitStrip } from "@/components/home/VisitStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function Home() {
  return (
    <>
      <Hero />

      <div className="py-12 sm:py-16">
        <TrustBadges />
      </div>

      <section id="categories" className="section pb-4">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Browse"
            title="Shop by Category"
            description="Find exactly what you're looking for"
            viewAll={{ href: "/products", label: "All products" }}
          />
        </ScrollReveal>
        <CategoryGrid />
      </section>

      <HomeRails />

      <PromoBanners />

      <VisitStrip />
    </>
  );
}
