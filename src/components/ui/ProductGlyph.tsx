"use client";

import { Tablet, Laptop, Monitor, Puzzle, Cpu, LucideIcon } from "lucide-react";
import { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/cn";

const iconMap: Record<CategorySlug, LucideIcon> = {
  ipad: Tablet,
  "macbook-air": Laptop,
  macbook: Laptop,
  "macbook-pro": Laptop,
  imac: Monitor,
  surface: Cpu,
  accessories: Puzzle,
};

const gradientMap: Record<CategorySlug, string> = {
  ipad: "from-indigo-100 via-white to-violet-100",
  "macbook-air": "from-sky-100 via-white to-blue-50",
  macbook: "from-amber-50 via-white to-orange-100",
  "macbook-pro": "from-zinc-200 via-zinc-50 to-zinc-100",
  imac: "from-blue-100 via-white to-cyan-50",
  surface: "from-slate-200 via-white to-slate-100",
  accessories: "from-emerald-50 via-white to-teal-50",
};

const iconColorMap: Record<CategorySlug, string> = {
  ipad: "text-indigo-500",
  "macbook-air": "text-sky-500",
  macbook: "text-amber-500",
  "macbook-pro": "text-zinc-600",
  imac: "text-blue-500",
  surface: "text-slate-600",
  accessories: "text-emerald-500",
};

export function ProductGlyph({
  category,
  className,
  iconClassName,
}: {
  category: CategorySlug;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = iconMap[category];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-gradient-to-br",
        gradientMap[category],
        className
      )}
    >
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_50%)]" />
      <Icon
        strokeWidth={1.1}
        className={cn("relative", iconColorMap[category], iconClassName)}
      />
    </div>
  );
}
