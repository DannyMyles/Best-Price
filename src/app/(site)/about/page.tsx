import { ShieldCheck, MapPin, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata = {
  title: "About Us",
};

const points = [
  {
    icon: ShieldCheck,
    title: "Genuine devices",
    body: "Every laptop, phone, camera, TV and accessory we sell is genuine, with pricing that stays competitive.",
  },
  {
    icon: MapPin,
    title: "Based in Nairobi CBD",
    body: "Walk in at Bihi Towers to see a device in person before you buy, or order online for delivery.",
  },
  {
    icon: MessageCircle,
    title: "Real people on WhatsApp",
    body: "Questions about stock, specs or pricing get a fast reply from our team — no call centre.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <ScrollReveal>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          About PriceHub
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          We sell quality electronics at honest prices across Kenya — laptops, phones,
          tablets, desktops, cameras and lenses, TVs, audio and the accessories that go
          with them. Simple as that.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {points.map((p, i) => (
          <ScrollReveal key={p.title} delay={i * 0.08}>
            <div className="h-full rounded-2xl border border-border bg-surface p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-brand">
                <p.icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
