import {
  ShieldCheck,
  Truck,
  Smartphone,
  Headphones,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { Marquee } from "@/components/ui/Marquee";

/** Each item carries its own icon tint so the ticker reads as a lively set
 *  of chips rather than a monotone line. Class strings are written out in
 *  full so Tailwind keeps them. */
const badges = [
  {
    icon: ShieldCheck,
    text: "Genuine products, full manufacturer warranty",
    chip: "bg-brand/12 text-brand",
  },
  {
    icon: Smartphone,
    text: "Secure M-Pesa — pay the way Kenya pays",
    chip: "bg-mpesa/15 text-mpesa",
  },
  {
    icon: Truck,
    text: "Countrywide delivery in 2–5 days",
    chip: "bg-brand/12 text-brand",
  },
  {
    icon: MapPin,
    text: "Free pickup at Bihi Towers, Nairobi CBD",
    chip: "bg-accent/15 text-accent",
  },
  {
    icon: RotateCcw,
    text: "7-day returns on unopened items",
    chip: "bg-brand/12 text-brand",
  },
  {
    icon: Headphones,
    text: "Real humans on WhatsApp — reply in minutes",
    chip: "bg-mpesa/15 text-mpesa",
  },
];

export function TrustBadges() {
  return (
    <section aria-label="Why shop with PriceHub" className="py-5">
      <Marquee className="py-1" duration={38}>
        {badges.map((b) => (
          <span
            key={b.text}
            className="mx-2 flex items-center gap-2.5 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink/80 shadow-sm"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${b.chip}`}
            >
              <b.icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            {b.text}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
