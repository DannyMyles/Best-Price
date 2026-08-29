import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  viewAll,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  viewAll?: { href: string; label?: string };
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4 sm:mb-8", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {viewAll && (
        <Link
          href={viewAll.href}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-strong sm:flex"
        >
          {viewAll.label ?? "View all"} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
