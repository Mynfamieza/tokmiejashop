"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRightIcon,
  BowlIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { useCart } from "@/components/cart/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { COD_DELIVERY_FEE, DELIVERY_FEE, FREE_DELIVERY_MIN_QUANTITY } from "@/lib/delivery";
import { cn, formatPrice } from "@/lib/utils";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
  } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const panel = panelRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 h-full w-full cursor-default bg-cocoa-950/40 backdrop-blur-sm"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-cocoa-900/10 px-5 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-lg font-semibold text-cocoa-900">
              Your cart
            </h2>
            <span aria-live="polite" className="text-sm text-cocoa-500">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-full text-cocoa-600 transition hover:bg-cocoa-900/5 hover:text-cocoa-900"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <EmptyCart onBrowse={closeCart} />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-cocoa-900/8 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-cocoa-900/10 bg-cream-100"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-cocoa-400">
                        <BowlIcon className="h-6 w-6" strokeWidth={1.4} />
                      </span>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-medium text-cocoa-900 transition-colors hover:text-brand-700"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-cocoa-500 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <span className="mt-0.5 text-xs text-cocoa-500">
                      {formatPrice(item.price)}
                    </span>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-full border border-cocoa-900/15">
                        <button
                          type="button"
                          onClick={() => decrement(item.productId)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full text-cocoa-700 transition hover:bg-cocoa-900/5 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span
                          aria-live="polite"
                          className="w-8 text-center text-sm font-semibold text-cocoa-900"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.productId)}
                          disabled={item.quantity >= item.maxQuantity}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="grid h-8 w-8 place-items-center rounded-full text-cocoa-700 transition hover:bg-cocoa-900/5 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-cocoa-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-cocoa-900/10 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cocoa-500">Subtotal</span>
                <span
                  aria-live="polite"
                  className="font-display text-lg font-semibold text-cocoa-900"
                >
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-cocoa-500">
                Delivery RM{DELIVERY_FEE.toFixed(2)} (Pay Now) or RM
                {COD_DELIVERY_FEE.toFixed(2)} (COD) · FREE for{" "}
                {FREE_DELIVERY_MIN_QUANTITY}+ jars.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={cn(buttonVariants({ size: "lg" }), "w-full")}
                >
                  Checkout
                </Link>
                <button
                  type="button"
                  onClick={closeCart}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "md" }),
                    "w-full",
                  )}
                >
                  Continue shopping
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-1 text-xs font-medium text-cocoa-500 transition-colors hover:text-brand-700"
                >
                  Clear cart
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream-100 text-cocoa-400">
        <BowlIcon className="h-7 w-7" strokeWidth={1.4} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg font-semibold text-cocoa-900">
          Your cart is empty
        </p>
        <p className="text-sm text-cocoa-500">
          Add something delicious from the shop.
        </p>
      </div>
      <Link
        href="/products"
        onClick={onBrowse}
        className={cn(buttonVariants({ variant: "outline", size: "md" }))}
      >
        Browse the shop
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
