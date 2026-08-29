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

const vFade =
  "linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent)";

export function TrustBadges() {
  return (
    <section
      aria-label="Why shop with PriceHub"
      className="relative overflow-hidden py-6"
      style={{ ["--sheen-color" as string]: "rgba(29,78,216,0.10)" }}
    >
      {/* horizontally panning tint that fades out top & bottom — no hard edges */}
      <div
        aria-hidden
        className="animate-gradient-pan pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #eef3ff 0%, #dce8ff 38%, #f4f7ff 58%, #eef3ff 100%)",
          maskImage: vFade,
          WebkitMaskImage: vFade,
        }}
      />
      {/* faint colour glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-brand/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-accent/12 blur-3xl"
      />

      <div className="band-sheen relative">
        <Marquee className="py-3" duration={34}>
          {badges.map((b) => (
            <span
              key={b.text}
              className="mx-2 flex items-center gap-2.5 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink/80 shadow-sm transition-colors hover:border-brand/40"
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
      </div>
    </section>
  );
}
