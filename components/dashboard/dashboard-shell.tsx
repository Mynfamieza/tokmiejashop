import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { DashboardNav } from "./dashboard-nav";
import { SignOutButton } from "./sign-out-button";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-cream-50">
      <header className="sticky top-0 z-40 border-b border-cocoa-900/10 bg-cream-50/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="hidden rounded-full bg-cocoa-900/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-cocoa-500 sm:inline">
              Owner
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden text-sm font-medium text-cocoa-600 transition-colors hover:text-cocoa-900 sm:inline"
            >
              View store
            </Link>
            <SignOutButton />
          </div>
        </div>

        <div className="container-page pb-3">
          <DashboardNav />
        </div>
      </header>

      <main className="container-page flex-1 py-6 sm:py-8">{children}</main>
    </div>
  );
}
