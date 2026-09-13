"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/finance", label: "Finance" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-1"
      aria-label="Navigasi papan pemuka"
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-700 text-cream-50"
                : "text-cocoa-600 hover:bg-cocoa-900/5 hover:text-cocoa-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
