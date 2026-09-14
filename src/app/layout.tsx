import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CompareProvider } from "@/context/CompareContext";
import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "@/components/ui/Toaster";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_EMAIL,
  STORE_ADDRESS,
  SOCIAL_LINKS,
} from "@/lib/contact";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "PriceHub — The best price on the tech you want";
const description =
  "Shop laptops, phones, tablets, cameras, TVs, audio and accessories at honest prices in Kenya. Secure M-Pesa payment, countrywide delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · PriceHub",
  },
  description,
  applicationName: "PriceHub",
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "PriceHub",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0C0E",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PriceHub",
  alternateName: "BallyTech Electronics",
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  email: SUPPORT_EMAIL,
  telephone: SUPPORT_PHONE_DISPLAY,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE_ADDRESS,
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SUPPORT_PHONE_DISPLAY,
    contactType: "customer service",
    areaServed: "KE",
    availableLanguage: ["en", "sw"],
  },
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PriceHub",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/products?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgJsonLd, siteJsonLd]),
          }}
        />
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>{children}</CompareProvider>
            </WishlistProvider>
          </CartProvider>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
