"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CategorySlug, Product } from "@/lib/types";

export interface CartLine {
  sku: string;
  name: string;
  slug: string;
  price: number | null;
  compareAtPrice?: number | null;
  color?: string;
  quantity: number;
  category: CategorySlug;
  image?: string;
}

interface CartContextValue {
  lines: CartLine[];
  saved: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (sku: string) => void;
  moveToCart: (sku: string) => void;
  removeSaved: (sku: string) => void;
  itemCount: number;
  subtotal: number;
  hasPOAItems: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "pricehub-cart";
const SAVED_KEY = "pricehub-saved";
const LEGACY_KEY = "bestprice-cart";

function toLine(product: Product, quantity: number): CartLine {
  return {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    color: product.color,
    quantity,
    category: product.category,
    image: product.images?.[0],
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [saved, setSaved] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage isn't available during SSR, so the cart can only be
    // hydrated after mount — an effect is the correct tool here.
    try {
      const raw =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
      const rawSaved = window.localStorage.getItem(SAVED_KEY);
      if (rawSaved) setSaved(JSON.parse(rawSaved));
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === product.sku);
      if (existing) {
        return prev.map((l) =>
          l.sku === product.sku ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [...prev, toLine(product, quantity)];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((sku: string) => {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.sku !== sku)
        : prev.map((l) => (l.sku === sku ? { ...l, quantity } : l))
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const saveForLater = useCallback((sku: string) => {
    setLines((prev) => {
      const line = prev.find((l) => l.sku === sku);
      if (line) setSaved((s) => (s.some((x) => x.sku === sku) ? s : [...s, line]));
      return prev.filter((l) => l.sku !== sku);
    });
  }, []);

  const moveToCart = useCallback((sku: string) => {
    setSaved((prev) => {
      const line = prev.find((l) => l.sku === sku);
      if (line)
        setLines((c) =>
          c.some((x) => x.sku === sku)
            ? c.map((x) =>
                x.sku === sku ? { ...x, quantity: x.quantity + line.quantity } : x
              )
            : [...c, line]
        );
      return prev.filter((l) => l.sku !== sku);
    });
  }, []);

  const removeSaved = useCallback((sku: string) => {
    setSaved((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + (l.price ?? 0) * l.quantity, 0),
    [lines]
  );
  const hasPOAItems = useMemo(() => lines.some((l) => l.price === null), [lines]);

  const value: CartContextValue = {
    lines,
    saved,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeSaved,
    itemCount,
    subtotal,
    hasPOAItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
