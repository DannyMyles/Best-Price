import { ShieldCheck, Truck, Smartphone, Headphones } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
    <section className="section">
      <ScrollReveal>
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:grid-cols-4 sm:p-6">
          {badges.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-050 text-brand">
                <b.icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{b.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {b.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
