import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata = {
  title: "FAQs — BestPrice Technologies",
};

const faqs = [
  {
    q: "Are your devices genuine?",
    a: "Yes — every MacBook, iPad, iMac and Surface device we sell is genuine. Nothing refurbished or grey-market unless clearly stated.",
  },
  {
    q: "How do I pay?",
    a: "M-Pesa, cash or bank transfer. Payment is confirmed directly with our team on WhatsApp after you place an order.",
  },
  {
    q: "Do you deliver outside Nairobi?",
    a: "Yes, we deliver countrywide. Delivery cost and timing depend on your location and are confirmed at checkout via WhatsApp.",
  },
  {
    q: "Can I see the device before I buy?",
    a: "Of course — visit us at Bihi Towers, G7 Ground Floor, Nairobi CBD, and our team will walk you through the device in person.",
  },
  {
    q: "What if a product I want isn't listed?",
    a: "Message us on WhatsApp — we can often source specific configurations even if they're not on the site yet.",
  },
];

export default function FAQsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <ScrollReveal>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Frequently Asked Questions
        </h1>
      </ScrollReveal>

      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface px-5">
        {faqs.map((item, i) => (
          <ScrollReveal key={item.q} delay={i * 0.05} className="py-5">
            <h3 className="text-sm font-semibold text-ink">{item.q}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.a}</p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
