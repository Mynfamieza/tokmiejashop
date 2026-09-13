"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { isInStock } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuickAddButton({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const inStock = isInStock(product);

  function handleAdd() {
    if (!inStock) return;
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!inStock}
      aria-label={
        inStock
          ? `Tambah ${product.name} ke troli`
          : `${product.name} tiada stok`
      }
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border font-medium transition",
        added
          ? "border-brand-700 bg-brand-700 text-cream-50"
          : "border-cocoa-900/15 text-cocoa-700 hover:border-brand-700/40 hover:text-brand-700",
        "disabled:cursor-not-allowed disabled:opacity-60",
        large ? "h-11 px-5 text-sm" : "h-9 px-3 text-xs",
      )}
    >
      {added ? (
        <CheckIcon className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      ) : (
        <PlusIcon className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      )}
      {added ? "Added" : inStock ? "Add" : "Sold out"}
    </button>
  );
}
