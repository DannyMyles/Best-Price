import Link from "next/link";
import { MapPin, MessageCircle, ArrowRight, Clock, Smartphone } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CopyInline } from "@/components/ui/CopyInline";
import {
  WHATSAPP_NUMBER,
  STORE_ADDRESS,
  STORE_HOURS,
  MPESA_PAYBILL_NUMBER,
} from "@/lib/contact";

export function VisitStrip() {
  return (
    <section className="section py-12 sm:py-16">
      <ScrollReveal>
        <div className="grid grid-cols-1 gap-6 rounded-3xl bg-panel-dark p-6 text-white sm:p-10 lg:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold sm:text-2xl">
              Questions before you buy?
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Talk to a real person. We&apos;ll help you pick the right device and
              arrange payment and delivery.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Contact page <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:border-l lg:border-white/10 lg:pl-10">
            <Detail icon={MapPin} label="Visit the shop" value={STORE_ADDRESS} />
            <Detail icon={Clock} label="Open" value={STORE_HOURS} />
            <Detail
              icon={Smartphone}
              label="Pay with M-Pesa"
              value={
                <>
                  Send Money to{" "}
                  <CopyInline
                    value={MPESA_PAYBILL_NUMBER.replace(/\s/g, "")}
                    display={
                      <span className="font-semibold">{MPESA_PAYBILL_NUMBER}</span>
                    }
                    toastMessage="M-Pesa number copied"
                    ariaLabel="Copy M-Pesa number"
                    className="text-white"
                  />
                </>
              }
            />
            <Detail
              icon={MessageCircle}
              label="Order tracking"
              value="Follow up any time on WhatsApp"
            />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-2" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-white/85">{value}</p>
      </div>
    </div>
  );
}
