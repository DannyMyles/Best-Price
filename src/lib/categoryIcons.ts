import {
  Laptop,
  Tablet,
  Monitor,
  Smartphone,
  Camera,
  Aperture,
  Tv,
  Speaker,
  Puzzle,
  Cpu,
  Package,
  type LucideIcon,
} from "lucide-react";

export const DEFAULT_CATEGORY_ICON: LucideIcon = Package;

/** Maps an icon key OR a category slug to a lucide icon. Accepts both so a
 *  category doc can set `icon: "camera"` or we can just pass its slug.
 *  Index this directly (`categoryIconMap[key] ?? DEFAULT_CATEGORY_ICON`) so
 *  React sees a stable component reference rather than a call result. */
export const categoryIconMap: Record<string, LucideIcon> = {
  laptop: Laptop,
  laptops: Laptop,
  macbook: Laptop,
  tablet: Tablet,
  tablets: Tablet,
  ipad: Tablet,
  monitor: Monitor,
  desktop: Monitor,
  desktops: Monitor,
  imac: Monitor,
  smartphone: Smartphone,
  phone: Smartphone,
  phones: Smartphone,
  camera: Camera,
  cameras: Camera,
  aperture: Aperture,
  lens: Aperture,
  lenses: Aperture,
  tv: Tv,
  tvs: Tv,
  television: Tv,
  speaker: Speaker,
  audio: Speaker,
  headphones: Speaker,
  puzzle: Puzzle,
  accessory: Puzzle,
  accessories: Puzzle,
  cpu: Cpu,
  surface: Cpu,
};

/** Non-render-path helper (e.g. building a lookup outside JSX). */
export function categoryIcon(key?: string): LucideIcon {
  if (!key) return DEFAULT_CATEGORY_ICON;
  const k = key.toLowerCase();
  return categoryIconMap[k] ?? categoryIconMap[k.replace(/s$/, "")] ?? DEFAULT_CATEGORY_ICON;
}
