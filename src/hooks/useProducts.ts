"use client";

import { useCallback, useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import type { Product } from "@/lib/types";

let cache: Product[] | null = null;

/** Shared product data source for every product-browsing surface (home
 *  search, products page, featured rail) so results stay consistent. */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getProducts()
      .then((result) => {
        if (!active) return;
        cache = result;
        setProducts(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (cache) return;
    // load() calls setState to reflect fetch progress — expected here since
    // it synchronises React with an async external data source.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    return load();
  }, [load]);

  const retry = useCallback(() => {
    cache = null;
    load();
  }, [load]);

  return { products, loading, error, retry };
}
