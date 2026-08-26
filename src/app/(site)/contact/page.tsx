"use client";

import { useState } from "react";
import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { WHATSAPP_NUMBER } from "@/components/layout/WhatsAppButton";

const mapSrc =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("Bihi Towers, Nairobi CBD, Kenya") +
  "&output=embed";

export default function ContactPage() {
  const [message, setMessage] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    setMessage("");
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <ScrollReveal>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Contact Us
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Have a question about a product or an order? Reach us directly — we
          typically reply within minutes on WhatsApp.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ScrollReveal delay={0.1} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<MapPin className="h-5 w-5" />}
              label="Location"
              value="Bihi Towers, G7 Ground Floor, Nairobi CBD"
            />
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              label="Phone"
              value="+254 721 966663"
              href="tel:+254721966663"
            />
            <InfoCard
              icon={<MessageCircle className="h-5 w-5" />}
              label="WhatsApp"
              value="Chat with us"
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
            />
            <InfoCard
              icon={<Clock className="h-5 w-5" />}
              label="Hours"
              value="Mon – Sat, 9am – 6pm"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={mapSrc}
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BestPrice Technologies location"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <form
            onSubmit={handleSend}
            className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
          >
            <h2 className="text-base font-semibold text-ink">Send us a message</h2>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Tell us what you're looking for…"
              className="flex-1 rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-sm outline-none focus:border-brand/50"
            />
            <AnimatedButton type="submit" variant="primary" className="w-full">
              <MessageCircle className="h-4 w-4" /> Send via WhatsApp
            </AnimatedButton>
          </form>
        </ScrollReveal>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-ink">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="block transition-transform hover:-translate-y-0.5"
      >
        {content}
      </a>
    );
  }
  return content;
}
