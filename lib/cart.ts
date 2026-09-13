import type { Product } from "@/lib/types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  quantity: number;
  /** Upper bound for this line (based on stock when tracked). */
  maxQuantity: number;
};

export const CART_STORAGE_KEY = "tokmieja.cart.v1";
export const MAX_QUANTITY = 99;

/** Clamp any value to a whole number between 1 and `max`. */
export function clampQuantity(value: number, max = MAX_QUANTITY): number {
  const safeMax = Number.isFinite(max) && max >= 1 ? Math.floor(max) : MAX_QUANTITY;
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(Math.floor(value), safeMax));
}

export function maxQuantityFor(
  product: Pick<Product, "stock_quantity">,
): number {
  const stock = product.stock_quantity;
  if (typeof stock === "number" && stock > 0) {
    return Math.min(stock, MAX_QUANTITY);
  }
  return MAX_QUANTITY;
}

export function isInStock(product: Pick<Product, "stock_quantity">): boolean {
  return typeof product.stock_quantity === "number" && product.stock_quantity > 0;
}

export function productToCartItem(
  product: Product,
  quantity: number,
): CartItem {
  const maxQuantity = maxQuantityFor(product);
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    imageUrl: product.image_url,
    category: product.category,
    quantity: clampQuantity(quantity, maxQuantity),
    maxQuantity,
  };
}

export function computeSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function computeItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clampQuantity(parsed, Number.MAX_SAFE_INTEGER);
}

/**
 * Safely read a cart from storage. Invalid or corrupt data yields an empty
 * cart instead of throwing. Duplicate product ids are merged.
 */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const byId = new Map<string, CartItem>();

  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;

    if (typeof record.productId !== "string" || record.productId.length === 0) {
      continue;
    }
    if (typeof record.name !== "string" || record.name.length === 0) continue;

    const price = typeof record.price === "number" ? record.price : Number(record.price);
    if (!Number.isFinite(price) || price < 0) continue;

    const maxQuantity = toPositiveInt(record.maxQuantity, MAX_QUANTITY);
    const quantity = clampQuantity(toPositiveInt(record.quantity, 1), maxQuantity);

    const existing = byId.get(record.productId);
    if (existing) {
      byId.set(record.productId, {
        ...existing,
        quantity: clampQuantity(existing.quantity + quantity, maxQuantity),
      });
      continue;
    }

    byId.set(record.productId, {
      productId: record.productId,
      slug: typeof record.slug === "string" ? record.slug : "",
      name: record.name,
      price,
      imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : null,
      category: typeof record.category === "string" ? record.category : "",
      quantity,
      maxQuantity,
    });
  }

  return [...byId.values()];
}
