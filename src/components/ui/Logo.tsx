import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * bally.png is a wide icon+wordmark lockup (2172x724) designed for light
 * backgrounds — the wordmark itself is dark navy. LogoMark crops just the
 * leading icon glyph (a clean square, no text) for use on dark surfaces
 * like the navy navbar/footer; LogoFull shows the whole lockup for light
 * backgrounds such as the admin login card.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="BestPrice Technologies"
      className={cn("inline-block bg-no-repeat", className)}
      style={{
        backgroundImage: "url(/bally.png)",
        backgroundSize: "300% 100%",
        backgroundPosition: "left center",
      }}
    />
  );
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-[2172/724]", className)}>
      <Image src="/bally.png" alt="BestPrice Technologies" fill className="object-contain" priority />
    </div>
  );
}
