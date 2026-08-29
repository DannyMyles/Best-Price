import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata = {
  title: "Returns & Refunds",
};

const sections = [
  {
    title: "7-day return window",
    body: "If a device arrives faulty or not as described, contact us within 7 days of delivery to arrange a return.",
  },
  {
    title: "Condition",
    body: "Returned items must be unused, in original packaging, with all accessories and documentation included.",
  },
  {
    title: "How to start a return",
    body: "Message us on WhatsApp with your order details and the issue — our team will confirm the next steps.",
  },
  {
    title: "Refunds",
    body: "Approved refunds are processed back to the original payment method within 5–7 business days.",
  },
  {
    title: "Warranty",
    body: "Devices carry the manufacturer's standard warranty. We'll help coordinate warranty claims where applicable.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <ScrollReveal>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Return &amp; Refund Policy
        </h1>
        <p className="mt-3 text-sm text-muted">
          We want you to be confident buying from PriceHub. Here&apos;s
          how returns work.
        </p>
      </ScrollReveal>

      <div className="mt-8 flex flex-col gap-4">
        {sections.map((s, i) => (
          <ScrollReveal key={s.title} delay={i * 0.05}>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
