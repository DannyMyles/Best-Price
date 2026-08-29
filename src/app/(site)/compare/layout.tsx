import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Products",
  description: "Compare up to 4 products side by side on PriceHub.",
  robots: { index: false, follow: true },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
