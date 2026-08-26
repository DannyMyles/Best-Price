import { isFirebaseConfigured } from "@/lib/firebase/config";
import { fetchAllCategories } from "@/lib/firebase/categories";
import { categories as seedCategories } from "@/lib/data/categories";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  if (!isFirebaseConfigured) return seedCategories;
  try {
    const remote = await fetchAllCategories();
    return remote.length > 0 ? remote : seedCategories;
  } catch {
    return seedCategories;
  }
}
