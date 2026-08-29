import type { Metadata } from "next";
import { DealsView } from "./DealsView";

export const metadata: Metadata = {
  title: "Deals & Clearance",
  description:
    "Genuine price drops and clearance stock at PriceHub — laptops, phones, cameras, TVs and audio at their lowest prices while stock lasts.",
  alternates: { canonical: "/deals" },
  openGraph: {
    title: "Deals & Clearance · PriceHub",
    description:
      "Genuine price drops and clearance stock — while it lasts.",
    url: "/deals",
    type: "website",
  },
};

export default function DealsPage() {
  return <DealsView />;
}
