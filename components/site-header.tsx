"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { useCart } from "@/components/cart/cart-provider";
import { CartIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-cocoa-900/10 bg-cream-50/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-7">
          <BrandMark />

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative text-sm transition-colors",
                  isActive(item.href)
                    ? "font-semibold text-brand-700"
                    : "font-medium text-cocoa-600 hover:text-cocoa-900",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCart}
            aria-label={
              itemCount > 0 ? `Open cart, ${itemCount} items` : "Open cart"
            }
            className="relative grid h-10 w-10 place-items-center rounded-full text-cocoa-700 transition hover:bg-cocoa-900/5 hover:text-cocoa-900"
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[0.65rem] font-bold text-cream-50">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full text-cocoa-700 transition hover:bg-cocoa-900/5 hover:text-cocoa-900 md:hidden"
          >
            {open ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-cocoa-900/10 bg-cream-50 md:hidden"
        >
          <nav
            className="container-page flex flex-col py-2"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-3 text-base transition-colors",
                  isActive(item.href)
                    ? "font-semibold text-brand-700"
                    : "font-medium text-cocoa-700 hover:bg-cocoa-900/5",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-medium text-cocoa-400 transition hover:bg-cocoa-900/5"
            >
              Owner login
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
