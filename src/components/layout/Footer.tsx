import Link from "next/link";
import { MapPin, Phone, Clock, Smartphone } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { LogoFull } from "@/components/ui/Logo";
import { WHATSAPP_NUMBER } from "./WhatsAppButton";

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
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
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
                  href="https://www.google.com/maps?q=Nation+Centre,+Nairobi+CBD,+Kenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand transition-colors hover:text-ink"
                >
                  Nation Centre
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted/70" />
                <span>
                  <span className="text-muted/70">Address: </span>
                  Nation Centre, Nairobi CBD, Kenya
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

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5">
              <Smartphone className="h-4 w-4 shrink-0 text-brand" />
              <p className="text-xs text-muted">
                We accept <span className="font-medium text-ink">M-Pesa</span>, cash
                and bank transfer — confirmed via WhatsApp at checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <Link href="/">
            <LogoFull className="h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted/70">
              Our Socials
            </span>
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
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.2.2-.4.1-.1 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2.9 2.4.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" />
                </svg>
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
