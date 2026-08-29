import { cn } from "@/lib/cn";

/**
 * PriceHub wordmark, drawn inline so it recolours with the surrounding text
 * ("Price" uses `currentColor`, "Hub" + the mark use the brand colour) and
 * needs no image request. Works on both light and dark surfaces.
 */

export function PriceHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="PriceHub"
      className={cn("shrink-0", className)}
    >
      <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--brand)" />
      {/* stylised "h" / price-tag hybrid */}
      <path
        d="M14 10v20M14 20c0-3.6 2.5-6 6-6s6 2.4 6 6v10"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="27.5" cy="12.5" r="2.6" fill="#fff" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return <PriceHubMark className={className} />;
}

export function LogoFull({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-sans text-[1.35rem] font-bold leading-none tracking-tight",
        className
      )}
    >
      <PriceHubMark className="h-[1.5em] w-[1.5em]" />
      <span className="text-current">
        Price<span className="text-brand">Hub</span>
      </span>
    </span>
  );
}
