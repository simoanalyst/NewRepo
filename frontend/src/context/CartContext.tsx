"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "@/types";
import { products as allProducts } from "@/data/products";

export interface CartEntry {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  entries: CartEntry[];
  items: Array<{ product: Product; quantity: number }>;
  itemCount: number;
  subtotalKes: number;
  addItem: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "kj_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, hydrated]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.productId === productId);
      if (existing) {
        return prev.map((e) => (e.productId === productId ? { ...e, quantity: e.quantity + quantity } : e));
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setEntries((prev) =>
      quantity <= 0 ? prev.filter((e) => e.productId !== productId) : prev.map((e) => (e.productId === productId ? { ...e, quantity } : e))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setEntries((prev) => prev.filter((e) => e.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setEntries([]), []);

  const items = useMemo(
    () =>
      entries
        .map((e) => ({ product: allProducts.find((p) => p.id === e.productId), quantity: e.quantity }))
        .filter((i): i is { product: Product; quantity: number } => Boolean(i.product)),
    [entries]
  );

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotalKes = useMemo(() => items.reduce((sum, i) => sum + i.product.priceKes * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ entries, items, itemCount, subtotalKes, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
