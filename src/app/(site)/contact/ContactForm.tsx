"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { whatsappLink } from "@/lib/contact";

const reasons = [
  "Product enquiry / availability",
  "Price & bulk / wholesale quote",
  "Order status or delivery",
  "Warranty, return or repair",
  "Something else",
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<string>(reasons[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    const body = [
      "Hi PriceHub 👋",
      "",
      `Reason: ${reason}`,
      name.trim() ? `Name: ${name.trim()}` : undefined,
      phone.trim() ? `Phone: ${phone.trim()}` : undefined,
      "",
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(body), "_blank");
    setSent(true);
  }

  return (
    <form
      onSubmit={handleSend}
      className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
    >
      <div>
        <h2 className="text-base font-semibold text-ink">Send us a message</h2>
        <p className="mt-1 text-xs text-muted">
          It opens WhatsApp with your details filled in — just hit send.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/70">
            Name (optional)
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            placeholder="Jane Wanjiru"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink/70">
            Phone (optional)
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field"
            inputMode="tel"
            placeholder="07XX XXX XXX"
            autoComplete="tel"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink/70">
          What&apos;s it about?
        </span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="field"
        >
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col">
        <span className="mb-1 block text-xs font-medium text-ink/70">Message</span>
        <textarea
          required
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setSent(false);
          }}
          rows={5}
          placeholder="Tell us what you're looking for, the model, budget, delivery area…"
          className="field min-h-[7rem] flex-1"
        />
      </label>

      <AnimatedButton type="submit" variant="mpesa" className="w-full">
        <MessageCircle className="h-4 w-4" />
        {sent ? "Re-open WhatsApp" : "Send via WhatsApp"}
      </AnimatedButton>
    </form>
  );
}
