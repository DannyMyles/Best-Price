import Link from "next/link";
import { MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WHATSAPP_NUMBER } from "@/components/layout/WhatsAppButton";

export function VisitStrip() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <ScrollReveal>
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-panel-dark px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <h3 className="text-xl font-semibold sm:text-2xl">
              Prefer to talk it through?
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
              <MapPin className="h-4 w-4" /> Bihi Towers, G7 Ground Floor, Nairobi CBD
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
