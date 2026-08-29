import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your PriceHub order — delivery details, M-Pesa payment and confirmation.",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
