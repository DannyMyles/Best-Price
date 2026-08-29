import { cn } from "@/lib/cn";
import { formatKES, discountPercent } from "@/lib/format";

export function Price({
  price,
  compareAtPrice,
  size = "md",
  className,
}: {
  price: number | null;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const off = discountPercent(price, compareAtPrice);
  const priceClass =
    size === "lg"
      ? "text-2xl font-bold"
      : size === "sm"
        ? "text-sm font-semibold"
        : "text-base font-bold";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn(priceClass, "text-ink")}>{formatKES(price)}</span>
      {off !== null && (
        <>
          <span
            className={cn(
              "text-muted line-through",
              size === "lg" ? "text-base" : "text-xs"
            )}
          >
            {formatKES(compareAtPrice!)}
          </span>
          <span
            className={cn(
              "rounded-full bg-accent-050 px-1.5 py-0.5 font-semibold text-accent",
              size === "lg" ? "text-xs" : "text-[10px]"
            )}
          >
            −{off}%
          </span>
        </>
      )}
    </div>
  );
}
