"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { clampQuantity, isInStock, maxQuantityFor } from "@/lib/cart";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const inStock = isInStock(product);
  const max = maxQuantityFor(product);
  const [quantityText, setQuantityText] = useState("1");
  const [added, setAdded] = useState(false);

  const quantity = clampQuantity(Number.parseInt(quantityText, 10), max);

  function setQuantity(next: number) {
    setQuantityText(String(clampQuantity(next, max)));
  }

  function handleAdd() {
    if (!inStock) return;
    addItem(product, quantity);
    openCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-cocoa-500">Quantity</span>

        <div className="inline-flex items-center rounded-full border border-cocoa-900/15">
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            disabled={!inStock || quantity <= 1}
            aria-label="Kurangkan kuantiti"
            className="grid h-11 w-11 place-items-center rounded-full text-cocoa-700 transition hover:bg-cocoa-900/5 disabled:pointer-events-none disabled:opacity-40"
          >
            <MinusIcon className="h-4 w-4" />
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantityText}
            onChange={(event) =>
              setQuantityText(event.target.value.replace(/[^\d]/g, ""))
            }
            onBlur={() => setQuantity(quantity)}
            disabled={!inStock}
            aria-label="Kuantiti"
            className="h-11 w-12 border-0 bg-transparent text-center text-sm font-semibold text-cocoa-900 focus:outline-none disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!inStock || quantity >= max}
            aria-label="Tambah kuantiti"
            className="grid h-11 w-11 place-items-center rounded-full text-cocoa-700 transition hover:bg-cocoa-900/5 disabled:pointer-events-none disabled:opacity-40"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <span className="text-xs text-cocoa-400">
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={handleAdd}
        disabled={!inStock}
        className="w-full sm:w-auto"
      >
        {added ? (
          <>
            <CheckIcon className="h-4 w-4" />
            Added to cart
          </>
        ) : inStock ? (
          "Add to cart"
        ) : (
          "Out of stock"
        )}
      </Button>
    </div>
  );
}
