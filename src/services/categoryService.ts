import { fetchCategories } from "@/lib/api/categories";
import { categories as seedCategories } from "@/lib/data/categories";
import type { Category } from "@/lib/types";

/** Falls back to the built-in department list if the API is unreachable. */
export async function getCategories(): Promise<Category[]> {
  try {
    const remote = await fetchCategories();
    return remote.length > 0 ? remote : seedCategories;
  } catch {
    return seedCategories;
  }
}
