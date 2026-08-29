import { ShieldCheck, Truck, Smartphone, Headphones } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "Genuine products",
    body: "Authentic devices with manufacturer warranty.",
  },
  {
    icon: Smartphone,
    title: "Secure M-Pesa",
    body: "Pay the way Kenya pays — fast and familiar.",
  },
  {
    icon: Truck,
    title: "Countrywide delivery",
    body: "CBD pickup or courier to your door in 2–5 days.",
  },
  {
    icon: Headphones,
    title: "Real human support",
    body: "WhatsApp our team — usually replies in minutes.",
  },
];

export function TrustBadges() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="section grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-border">
        {badges.map((b, i) => (
          <div
            key={b.title}
            className={`flex items-start gap-3 py-5 ${
              i < 2 ? "border-b border-border sm:border-b-0" : ""
            } ${i % 2 === 0 ? "pr-3 sm:pr-6" : "pl-3 sm:pl-6"} ${
              i > 0 ? "sm:pl-6" : ""
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-050 text-brand">
              <b.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{b.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{b.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
