"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import type { Product } from "@/lib/types";

let cache: Product[] | null = null;

/** Shared product data source for every product-browsing surface (home
 *  search, products page, featured rail) so results stay consistent. */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    getProducts().then((result) => {
      if (!active) return;
      cache = result;
      setProducts(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}
