import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FeatureTiles } from "@/components/home/FeatureTiles";
import { HomeRails } from "@/components/home/HomeRails";
import { TrustBadges } from "@/components/home/TrustBadges";
import { VisitStrip } from "@/components/home/VisitStrip";
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
      <HeroCarousel />
      <CategoryStrip />
      <TrustBadges />
      <HomeRails />
      <FeatureTiles />
      <VisitStrip />
    </>
  );
}
