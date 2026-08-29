import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review the items in your PriceHub cart before checkout.",
  robots: { index: false, follow: true },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
