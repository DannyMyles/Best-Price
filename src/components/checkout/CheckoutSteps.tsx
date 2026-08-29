import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export const CHECKOUT_STEPS = ["Details", "Delivery", "Payment", "Review"] as const;
export type CheckoutStepIndex = 0 | 1 | 2 | 3;

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done && "bg-success text-white",
                  active && "bg-brand text-white",
                  !done && !active && "bg-surface-muted text-muted"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-semibold sm:block",
                  active ? "text-ink" : "text-muted"
                )}
              >
                {label}
              </span>
            </div>
            {i < CHECKOUT_STEPS.length - 1 && (
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  done ? "bg-success" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
