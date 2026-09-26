"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/lib/types";

let cache: Category[] | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    getCategories().then((result) => {
      if (!active) return;
      cache = result;
      setCategories(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
}
