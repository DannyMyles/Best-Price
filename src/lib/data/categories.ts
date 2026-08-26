import { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    slug: "ipad",
    name: "iPad",
    shortName: "iPad",
    description: "Tablets for work, study and creativity",
    icon: "tablet",
  },
  {
    slug: "macbook-air",
    name: "MacBook Air",
    shortName: "Air",
    description: "Thin, light, all-day battery life",
    icon: "laptop",
  },
  {
    slug: "macbook",
    name: "MacBook",
    shortName: "MacBook",
    description: "Everyday performance, great value",
    icon: "laptop",
  },
  {
    slug: "macbook-pro",
    name: "MacBook Pro",
    shortName: "Pro",
    description: "Serious power for serious work",
    icon: "laptop",
  },
  {
    slug: "imac",
    name: "iMac",
    shortName: "iMac",
    description: "All-in-one desktop, built for speed",
    icon: "monitor",
  },
  {
    slug: "surface",
    name: "Microsoft Surface",
    shortName: "Surface",
    description: "Windows 2-in-1 devices",
    icon: "cpu",
  },
  {
    slug: "accessories",
    name: "Accessories",
    shortName: "Accessories",
    description: "Adapters, pencils, keyboards & more",
    icon: "puzzle",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
