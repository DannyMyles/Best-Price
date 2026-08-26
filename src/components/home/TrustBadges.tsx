import { ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const badges = [
  {
    icon: ShieldCheck,
    title: "Genuine Devices",
    body: "Every device is authentic, sourced and sold with confidence.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    body: "Nairobi CBD pickup, or countrywide delivery on order.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    body: "Real answers from our team — usually within minutes.",
  },
];

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="grid grid-cols-1 gap-4 rounded-3xl border border-border bg-white p-6 shadow-sm sm:grid-cols-3 sm:p-8">
          {badges.map((b) => (
            <div key={b.title} className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <b.icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{b.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
