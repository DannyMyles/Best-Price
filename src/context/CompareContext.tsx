"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "pricehub-compare";
const MAX = 4;

interface CompareContextValue {
  skus: string[];
  count: number;
  isFull: boolean;
  has: (sku: string) => boolean;
  toggle: (sku: string) => void;
  remove: (sku: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [skus, setSkus] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSkus(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(skus));
  }, [skus, hydrated]);

  const has = useCallback((sku: string) => skus.includes(sku), [skus]);

  const toggle = useCallback((sku: string) => {
    setSkus((prev) =>
      prev.includes(sku)
        ? prev.filter((s) => s !== sku)
        : prev.length >= MAX
          ? prev
          : [...prev, sku]
    );
  }, []);

  const remove = useCallback(
    (sku: string) => setSkus((prev) => prev.filter((s) => s !== sku)),
    []
  );
  const clear = useCallback(() => setSkus([]), []);

  const value = useMemo<CompareContextValue>(
    () => ({
      skus,
      count: skus.length,
      isFull: skus.length >= MAX,
      has,
      toggle,
      remove,
      clear,
    }),
    [skus, has, toggle, remove, clear]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
