"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clampQuantity,
  computeItemCount,
  computeSubtotal,
  maxQuantityFor,
  productToCartItem,
  type CartItem,
} from "@/lib/cart";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  setCartItems,
  subscribeCart,
} from "@/lib/cart-store";
import type { Product } from "@/lib/types";
import { useIsClient } from "@/lib/use-is-client";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  isClient: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const isClient = useIsClient();

  const addItem = useCallback((product: Product, quantity = 1) => {
    setCartItems((current) => {
      const maxQuantity = maxQuantityFor(product);
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                name: product.name,
                slug: product.slug,
                price: product.price,
                imageUrl: product.image_url,
                category: product.category,
                maxQuantity,
                quantity: clampQuantity(item.quantity + quantity, maxQuantity),
              }
            : item,
        );
      }

      return [...current, productToCartItem(product, quantity)];
    });
  }, []);

  const increment = useCallback((productId: string) => {
    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: clampQuantity(item.quantity + 1, item.maxQuantity),
            }
          : item,
      ),
    );
  }, []);

  const decrement = useCallback((productId: string) => {
    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: clampQuantity(item.quantity - 1, item.maxQuantity),
            }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clearCart = useCallback(() => setCartItems(() => []), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      isClient,
      itemCount: computeItemCount(items),
      subtotal: computeSubtotal(items),
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      items,
      isOpen,
      isClient,
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
