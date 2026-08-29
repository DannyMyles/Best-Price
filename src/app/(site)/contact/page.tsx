import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Navigation,
  Truck,
  HelpCircle,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CopyInline } from "@/components/ui/CopyInline";
import { ContactForm } from "./ContactForm";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_EMAIL,
  STORE_ADDRESS,
  STORE_HOURS,
  STORE_HOURS_NOTE,
  STORE_GEO,
  STORE_DIRECTIONS_URL,
  SOCIAL_LINKS,
  whatsappLink,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to PriceHub — WhatsApp, call, email or visit our shop at Bihi Towers, Nairobi CBD. We reply within minutes, Mon–Sat 9am–6pm.",
  alternates: { canonical: "/contact" },
};

const mapSrc =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("Bihi Towers, Nairobi CBD, Kenya") +
  "&output=embed";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ElectronicsStore",
  name: "PriceHub",
  description:
    "Multi-brand electronics shop in Nairobi — laptops, phones, tablets, cameras, TVs, audio and accessories.",
  telephone: SUPPORT_PHONE_DISPLAY,
  email: SUPPORT_EMAIL,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pricehub.co.ke",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bihi Towers, G7 Ground Floor, Moi Avenue",
    addressLocality: "Nairobi",
    addressRegion: "Nairobi",
    addressCountry: "KE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: STORE_GEO.lat,
    longitude: STORE_GEO.lng,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "09:00",
    closes: "18:00",
  },
  currenciesAccepted: "KES",
  paymentAccepted: "M-Pesa, Cash, Bank transfer",
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

export default function ContactPage() {
  return (
    <div className="section py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ScrollReveal>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Contact Us
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Have a question about a product or an order? Reach us directly — we
          typically reply within minutes on WhatsApp, {STORE_HOURS}.
        </p>
      </ScrollReveal>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ScrollReveal delay={0.1} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<MessageCircle className="h-5 w-5" />}
              label="WhatsApp"
              value="Chat with us"
              sub="Fastest — usually replies in minutes"
              href={whatsappLink()}
            />
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              label="Call / SMS"
              value={
                <CopyInline
                  value={SUPPORT_PHONE_DISPLAY.replace(/[^\d+]/g, "")}
                  display={SUPPORT_PHONE_DISPLAY}
                  toastMessage="Phone number copied"
                  ariaLabel="Copy phone number"
                  className="text-ink"
                />
              }
              sub="Tap the number to copy"
            />
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value={SUPPORT_EMAIL}
              href={`mailto:${SUPPORT_EMAIL}`}
            />
            <InfoCard
              icon={<Clock className="h-5 w-5" />}
              label="Hours"
              value={STORE_HOURS}
              sub={STORE_HOURS_NOTE}
            />
            <InfoCard
              className="sm:col-span-2"
              icon={<MapPin className="h-5 w-5" />}
              label="Visit the shop"
              value={STORE_ADDRESS}
              sub="G7, ground floor — walk-ins welcome"
              href={STORE_DIRECTIONS_URL}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted">Follow us</span>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink/80 transition-colors hover:border-brand/40 hover:text-brand"
              >
                {s.name}
              </a>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={mapSrc}
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="PriceHub location — Bihi Towers, Nairobi CBD"
            />
          </div>

          <a
            href={STORE_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-fit"
          >
            <Navigation className="h-4 w-4" /> Get directions
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="flex flex-col gap-5">
          {/* Wholesale / bulk */}
          <div className="rounded-2xl border border-brand/25 bg-brand-050/60 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand">
              <Truck className="h-4 w-4" /> Buying for a business or in bulk?
            </p>
            <p className="mt-1 text-sm text-muted">
              We supply schools, offices and resellers at wholesale rates. Send
              your list on WhatsApp for a same-day quote.
            </p>
            <a
              href={whatsappLink(
                "Hi PriceHub, I'd like a wholesale / bulk quote. Here's my list:"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-strong"
            >
              Request a wholesale quote →
            </a>
          </div>

          <ContactForm />

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted/50 p-4 text-sm text-muted">
            <HelpCircle className="h-4 w-4 shrink-0 text-brand" />
            <span>
              Quick question? Our{" "}
              <Link href="/faqs" className="font-semibold text-brand hover:underline">
                FAQs
              </Link>{" "}
              cover delivery, payment, warranty and returns.
            </span>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
  href,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-050 text-brand">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={`block transition-transform hover:-translate-y-0.5 ${className ?? ""}`}
      >
        {content}
      </a>
    );
  }
  return <div className={className}>{content}</div>;
}
