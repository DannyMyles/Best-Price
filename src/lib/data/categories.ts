import { Category } from "@/lib/types";

/** Seed / fallback category list. Firestore's `categories` collection
 *  overrides this once configured (managed from /admin/categories). */
export const categories: Category[] = [
  {
    slug: "laptops",
    name: "Laptops",
    shortName: "Laptops",
    description: "MacBooks and Windows laptops for work, study and play",
    icon: "laptop",
  },
  {
    slug: "phones",
    name: "Phones",
    shortName: "Phones",
    description: "Smartphones from every major brand",
    icon: "smartphone",
  },
  {
    slug: "tablets",
    name: "Tablets",
    shortName: "Tablets",
    description: "iPad and Android tablets for creativity on the go",
    icon: "tablet",
  },
  {
    slug: "desktops",
    name: "Desktops",
    shortName: "Desktops",
    description: "All-in-ones and desktop computers",
    icon: "monitor",
  },
  {
    slug: "cameras",
    name: "Cameras",
    shortName: "Cameras",
    description: "DSLR, mirrorless and compact cameras",
    icon: "camera",
  },
  {
    slug: "lenses",
    name: "Camera Lenses",
    shortName: "Lenses",
    description: "Lenses for Canon, Nikon and Sony",
    icon: "aperture",
  },
  {
    slug: "tvs",
    name: "TVs",
    shortName: "TVs",
    description: "4K smart TVs from Sony and Hisense",
    icon: "tv",
  },
  {
    slug: "audio",
    name: "Audio",
    shortName: "Audio",
    description: "Soundbars, speakers and headphones",
    icon: "speaker",
  },
  {
    slug: "accessories",
    name: "Accessories",
    shortName: "Accessories",
    description: "Keyboards, mice, storage, cables and more",
    icon: "puzzle",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
