import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Products you've saved on PriceHub for later.",
  robots: { index: false, follow: true },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
