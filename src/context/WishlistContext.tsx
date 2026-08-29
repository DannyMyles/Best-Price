"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface WishlistContextValue {
  slugs: string[];
  toggle: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "pricehub-wishlist";
const LEGACY_KEY = "bestprice-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage isn't available during SSR, so the wishlist can only be
    // hydrated after mount — an effect is the correct tool here.
    try {
      const raw =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSlugs(JSON.parse(raw));
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs, hydrated]);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return (
    <WishlistContext.Provider value={{ slugs, toggle, isSaved, count: slugs.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
