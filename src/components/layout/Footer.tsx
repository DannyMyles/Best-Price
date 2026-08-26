import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { LogoFull } from "@/components/ui/Logo";
import { WHATSAPP_NUMBER, WhatsAppIcon } from "./WhatsAppButton";

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

const socials = [
  { icon: FacebookIcon, href: "#", label: "Facebook" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-muted text-ink">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          <div>
            <h4 className="text-sm font-semibold text-ink">Get to Know Us</h4>
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
                <Link href="/contact" className="transition-colors hover:text-brand">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/returns" className="transition-colors hover:text-brand">
                  Return &amp; Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {categories.slice(0, 5).map((c) => (
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

          <div className="col-span-2 md:col-span-1">
            <Link href="/contact" className="text-sm font-semibold text-brand hover:text-ink">
              BestPrice Technologies
            </Link>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <span className="text-muted/70">Located in: </span>
                <a
                  href="https://www.google.com/maps?q=Bihi+Towers,+Nairobi+CBD,+Kenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand transition-colors hover:text-ink"
                >
                  Bihi Towers
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted/70" />
                <span>
                  <span className="text-muted/70">Address: </span>
                  Bihi Towers, G7 Ground Floor, Nairobi CBD, Kenya
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted/70" />
                <span className="text-muted/70">Phone: </span>
                <a href="tel:+254721966663" className="transition-colors hover:text-brand">
                  +254 721 966663
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted/70" />
                <span className="text-muted/70">Hours: </span>
                Mon–Sat, 9am – 6pm
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-white px-3.5 py-2.5">
              <div className="relative h-6 w-32 shrink-0 overflow-hidden rounded">
                <Image src="/mpesa.jpg" alt="M-Pesa" fill className="object-cover" />
              </div>
              <p className="text-xs text-muted">
                Plus <span className="font-medium text-ink">cash</span> and bank
                transfer — confirmed via WhatsApp at checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <Link href="/">
            <LogoFull className="h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink/70 shadow-sm transition-colors hover:bg-brand hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
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
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted/70">
          <Link href="/" className="text-brand hover:text-ink">
            BESTPRICE TECHNOLOGIES
          </Link>{" "}
          &copy; {year}
        </div>
      </div>
    </footer>
  );
}
