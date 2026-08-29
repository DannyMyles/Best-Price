import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeatureTiles } from "@/components/home/FeatureTiles";
import { HomeRails } from "@/components/home/HomeRails";
import { TrustBadges } from "@/components/home/TrustBadges";
import { PromoBanners } from "@/components/home/PromoBanners";
import { VisitStrip } from "@/components/home/VisitStrip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "PriceHub — Genuine electronics at honest prices in Kenya",
  },
  description:
    "PriceHub is a multi-brand electronics shop in Nairobi — laptops, phones, tablets, cameras, TVs, audio and accessories. Genuine stock, honest prices, secure M-Pesa payment and countrywide delivery.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBadges />

      <FeatureTiles />

      <HomeRails />

      <section id="categories" className="section py-12 sm:py-16">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Browse"
            title="Shop by Department"
            description="Every category, one tap away"
            viewAll={{ href: "/products", label: "All products" }}
          />
        </ScrollReveal>
        <CategoryGrid />
      </section>

      <PromoBanners />

      <VisitStrip />
    </>
  );
}
