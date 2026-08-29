"use client";

import { categoryIconMap, DEFAULT_CATEGORY_ICON } from "@/lib/categoryIcons";
import { cn } from "@/lib/cn";

const gradientMap: Record<string, string> = {
  laptops: "from-sky-100 via-white to-blue-50",
  phones: "from-violet-100 via-white to-fuchsia-50",
  tablets: "from-indigo-100 via-white to-violet-100",
  desktops: "from-blue-100 via-white to-cyan-50",
  cameras: "from-zinc-200 via-zinc-50 to-zinc-100",
  lenses: "from-neutral-200 via-white to-stone-100",
  tvs: "from-slate-200 via-white to-slate-100",
  audio: "from-rose-100 via-white to-orange-50",
  accessories: "from-emerald-50 via-white to-teal-50",
};
const DEFAULT_GRADIENT = "from-slate-100 via-white to-slate-50";

const iconColorMap: Record<string, string> = {
  laptops: "text-sky-500",
  phones: "text-violet-500",
  tablets: "text-indigo-500",
  desktops: "text-blue-500",
  cameras: "text-zinc-600",
  lenses: "text-neutral-500",
  tvs: "text-slate-600",
  audio: "text-rose-500",
  accessories: "text-emerald-500",
};
const DEFAULT_COLOR = "text-slate-500";

export function ProductGlyph({
  category,
  className,
  iconClassName,
}: {
  category: string;
  className?: string;
  iconClassName?: string;
}) {
  const key = category.toLowerCase();
  const Icon =
    categoryIconMap[key] ??
    categoryIconMap[key.replace(/s$/, "")] ??
    DEFAULT_CATEGORY_ICON;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-gradient-to-br",
        gradientMap[category] ?? DEFAULT_GRADIENT,
        className
      )}
    >
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_50%)]" />
      <Icon
        strokeWidth={1.1}
        className={cn(
          "relative",
          iconColorMap[category] ?? DEFAULT_COLOR,
          iconClassName
        )}
      />
    </div>
  );
}
