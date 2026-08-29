import { cn } from "@/lib/cn";

/** Seamless infinite marquee — renders two copies of `children` and slides
 *  the track by -50%. Pauses on hover; disabled under reduced-motion by the
 *  global CSS override. */
export function Marquee({
  children,
  duration = 32,
  className,
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("marquee-mask relative overflow-hidden", className)}
      style={
        {
          "--marquee-duration": `${duration}s`,
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        } as React.CSSProperties
      }
    >
      <div className="marquee-track">
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
