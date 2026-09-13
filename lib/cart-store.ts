import {
  CART_STORAGE_KEY,
  parseStoredCart,
  type CartItem,
} from "@/lib/cart";

const EMPTY: CartItem[] = [];
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return EMPTY;
  }
}

/** Stable client snapshot used by `useSyncExternalStore`. */
export function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache === null) {
    cache = readFromStorage();
  }
  return cache;
}

/** Stable server snapshot (empty cart) so SSR and hydration match. */
export function getCartServerSnapshot(): CartItem[] {
  return EMPTY;
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      cache = readFromStorage();
      listener();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Update the in-memory cart and persist it to localStorage. */
export function setCartItems(
  updater: (current: CartItem[]) => CartItem[],
): void {
  const next = updater(getCartSnapshot());
  cache = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode / quota). Cart still works in memory.
    }
  }

  listeners.forEach((listener) => listener());
}
