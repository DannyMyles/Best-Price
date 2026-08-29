import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PriceHub collects, uses and protects your personal data, in line with Kenya's Data Protection Act, 2019.",
  alternates: { canonical: "/privacy" },
};

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: "PriceHub (“we”, “us”) is a multi-brand electronics retailer based at Bihi Towers, G7 Ground Floor, Nairobi CBD, Kenya. We are the data controller for the personal data described in this policy.",
  },
  {
    title: "What we collect",
    body: "When you place an order or contact us we collect your name, phone number, email address (if given), delivery county, town and address, order details, and — where you provide it — an M-Pesa transaction code. We also collect standard technical data such as your device type and pages viewed, and information you choose to store in your browser (cart, wishlist, recently viewed).",
  },
  {
    title: "How we use it",
    body: "To process and deliver your order, confirm and reconcile payment, provide warranty and after-sales support, respond to your enquiries, prevent fraud, and meet our legal and tax obligations. We do not sell your personal data.",
  },
  {
    title: "Who we share it with",
    body: "Delivery and courier partners (to fulfil your order), our payment and banking providers (to confirm payment), and service providers who host our website and store our data on our behalf. We may disclose data where required by law or to protect our rights.",
  },
  {
    title: "Cookies and local storage",
    body: (
      <>
        We use a small number of cookies and browser local storage:{" "}
        <b>essential</b> items that remember your cart, wishlist, recently
        viewed products and your cookie choice; and, only if you allow it,{" "}
        <b>analytics</b> that help us understand which pages and products are
        popular. We do not use advertising cookies. You can change your choice
        at any time via “Cookie settings” in the footer, or by clearing your
        browser&apos;s site data.
      </>
    ),
  },
  {
    title: "Storage and retention",
    body: "Order records are kept for as long as needed for accounting, tax and warranty purposes (typically up to 7 years). Browser data (cart, wishlist) stays on your device until you clear it. We take reasonable technical and organisational measures to protect your data.",
  },
  {
    title: "Your rights",
    body: (
      <>
        Under the Data Protection Act, 2019 you may request access to, correction
        or deletion of your personal data, object to or restrict its processing,
        and withdraw consent. To exercise these rights contact us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-medium text-brand hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        or {SUPPORT_PHONE_DISPLAY}. You may also lodge a complaint with the Office
        of the Data Protection Commissioner (ODPC).
      </>
    ),
  },
  {
    title: "Changes",
    body: "We may update this policy from time to time. The latest version will always be published on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <ScrollReveal>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted">
          Last updated: {new Date().getFullYear()}. This summary explains how we
          handle your information. See also our{" "}
          <Link href="/terms" className="font-semibold text-brand hover:underline">
            Terms of Service
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
        This policy is provided as a starting point and is not legal advice.
        Have it reviewed against your final operations and the Data Protection
        Act, 2019 before launch.
      </p>
    </div>
  );
}
