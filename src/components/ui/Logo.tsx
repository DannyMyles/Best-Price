import { cn } from "@/lib/cn";

/**
 * The "b" mark — the real logo artwork (public/brand/), not a redrawn
 * approximation: the source file had a white background, so it's
 * pre-processed into a transparent PNG (see the crop/key script used to make
 * it) and trimmed to its own bounding box. If a vector (.ai/.eps/.svg)
 * original ever becomes available, swap it in here for a crisper mark at
 * large sizes.
 */
export function BallytechMark({ className }: { className?: string; onDark?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- scales via em-based className, not a fixed size next/image wants
    <img src="/brand/ballytech-mark.png" alt="" className={cn("inline-block shrink-0 object-contain", className)} />
  );
}

/** @deprecated kept so older imports keep compiling — use `BallytechMark`. */
export const PriceHubMark = BallytechMark;

export function LogoMark({ className }: { className?: string }) {
  return <BallytechMark className={className} />;
}

/** `onDark`: for dark backgrounds, where the ink wordmark would disappear. */
export function LogoFull({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-sans text-[1.35rem] font-bold leading-none tracking-tight",
        className
      )}
    >
      <BallytechMark className="h-[1.5em] w-[1.5em]" />
      <span className="inline-flex items-baseline gap-[0.3em]">
        <span className={onDark ? "text-white" : "text-brand"}>Bally</span>
        <span
          className={cn(
            "text-[0.42em] font-semibold uppercase tracking-[0.1em]",
            onDark ? "text-electric" : "text-accent"
          )}
        >
          Digital Solutions
        </span>
      </span>
    </span>
  );
}
