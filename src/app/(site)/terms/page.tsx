import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you browse PriceHub and place an order — pricing, payment, delivery, warranty and returns.",
  alternates: { canonical: "/terms" },
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Using this site",
    body: "By browsing PriceHub or placing an order you agree to these terms. You must be at least 18, or have the consent of a parent or guardian, to buy from us.",
  },
  {
    title: "Products and pricing",
    body: "We work hard to keep product details, images and prices accurate, but errors can occur. All prices are in Kenya Shillings (KES) and include applicable taxes unless stated. If a price is clearly wrong we may cancel the order and refund any amount paid. Stock is not reserved until an order is confirmed.",
  },
  {
    title: "Orders",
    body: "Placing an order is an offer to buy. An order is only accepted once we confirm it with you (usually on WhatsApp) and payment is received or agreed. We may decline or cancel an order — for example if the item is out of stock, the price was listed incorrectly, or we suspect fraud.",
  },
  {
    title: "Payment",
    body: "We accept M-Pesa (Send Money), cash on delivery for eligible areas, and bank transfer. For M-Pesa, send the exact amount to the number shown at checkout and share the confirmation code so we can match your order. Goods remain our property until paid for in full.",
  },
  {
    title: "Delivery",
    body: "Delivery fees and timelines depend on your location and are shown at checkout. Estimated timeframes (typically 2–5 business days countrywide, same-day for Nairobi CBD pickup) are not guaranteed and may be affected by courier delays or events outside our control. Please check items on delivery.",
  },
  {
    title: "Warranty, returns and refunds",
    body: (
      <>
        Products carry the manufacturer&apos;s standard warranty. Our return and
        refund terms — including the 7-day window for faulty or misdescribed
        items — are set out in the{" "}
        <Link
          href="/returns"
          className="font-medium text-brand hover:underline"
        >
          Returns &amp; Refunds
        </Link>{" "}
        policy, which forms part of these terms.
      </>
    ),
  },
  {
    title: "Liability",
    body: "To the extent permitted by law, our liability for any claim connected with an order is limited to the amount you paid for the product concerned. Nothing in these terms excludes liability that cannot lawfully be excluded, including under the Consumer Protection Act.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of Kenya, and any dispute is subject to the jurisdiction of the Kenyan courts.",
  },
  {
    title: "Contact",
    body: (
      <>
        Questions about these terms? See our{" "}
        <Link
          href="/contact"
          className="font-medium text-brand hover:underline"
        >
          Contact
        </Link>{" "}
        page.
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <ScrollReveal>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted">
          Last updated: {new Date().getFullYear()}. Please also read our{" "}
          <Link
            href="/privacy"
            className="font-semibold text-brand hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </ScrollReveal>

      <div className="mt-8 flex flex-col gap-4">
        {sections.map((s, i) => (
          <ScrollReveal key={s.title} delay={i * 0.04}>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">{s.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {s.body}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted">
        These terms are a starting template, not legal advice — have them
        reviewed before launch.
      </p>
    </div>
  );
}
