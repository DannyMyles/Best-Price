import Link from "next/link";
import { MapPin, Phone, Clock, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { LogoFull } from "@/components/ui/Logo";
import { WhatsAppIcon } from "./WhatsAppButton";
import {
  WHATSAPP_NUMBER,
  SUPPORT_PHONE_DISPLAY,
  STORE_ADDRESS,
  STORE_MAPS_URL,
  STORE_HOURS,
  MPESA_PAYBILL_NUMBER,
} from "@/lib/contact";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.28C16.3 4.19 15.32 4.1 14.2 4.1c-2.34 0-3.95 1.43-3.95 4.04V10.5H7.75v3h2.5V21h3.25Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const trust = [
  { icon: ShieldCheck, label: "Genuine products & warranty" },
  { icon: Truck, label: "Countrywide delivery" },
  { icon: RotateCcw, label: "7-day returns" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-muted text-ink">
      <div className="section py-12 sm:py-14">
        <div className="grid grid-cols-3 gap-6 border-b border-border pb-8 sm:gap-4">
          {trust.map((t) => (
            <div
              key={t.label}
              className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-050 text-brand">
                <t.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <span className="text-xs font-medium text-ink/80 sm:text-sm">
                {t.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-10 pt-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="text-panel-dark">
              <LogoFull className="text-[1.3rem]" />
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Honest prices on MacBooks, iPads, iMacs and Surface devices —
              delivered across Kenya, paid securely with M-Pesa.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink/70 shadow-sm transition-colors hover:bg-brand hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink/70 shadow-sm transition-colors hover:bg-brand hover:text-white"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="transition-colors hover:text-brand"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Help</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/about" className="transition-colors hover:text-brand">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="transition-colors hover:text-brand">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/returns" className="transition-colors hover:text-brand">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-brand">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Visit &amp; Pay</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted/70" />
                <a
                  href={STORE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand"
                >
                  {STORE_ADDRESS}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted/70" />
                <a
                  href={`tel:${SUPPORT_PHONE_DISPLAY.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-brand"
                >
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted/70" />
                {STORE_HOURS}
              </li>
              <li className="mt-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
                <p className="text-xs font-semibold text-mpesa">Lipa na M-Pesa</p>
                <p className="mt-0.5 text-xs text-muted">
                  Send Money to{" "}
                  <span className="font-semibold text-ink">
                    {MPESA_PAYBILL_NUMBER}
                  </span>{" "}
                  — plus cash &amp; bank transfer.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted/70">
          &copy; {year} PriceHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
