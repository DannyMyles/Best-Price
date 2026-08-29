import { cn } from "@/lib/cn";
import { badgeConfig, type BadgeVariant } from "@/lib/badges";

export function Badge({
  variant,
  children,
  className,
}: {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}) {
  const config = badgeConfig[variant];
  return (
    <span className={cn("badge", config.className, className)}>
      {children ?? config.label}
    </span>
  );
}
