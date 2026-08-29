import type { Metadata } from "next";
import { TrackView } from "./TrackView";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Check the status of your PriceHub order using your order reference and phone number.",
  alternates: { canonical: "/track" },
  robots: { index: true, follow: true },
};

export default function TrackPage() {
  return <TrackView />;
}
