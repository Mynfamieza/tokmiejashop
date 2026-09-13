import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import {
  WhatsAppFloatingButton,
  WhatsAppFooterLink,
} from "@/components/whatsapp-cta";
import { navItems, siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-cocoa-900/10">
      <div className="container-page flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <BrandMark />
          <p className="text-sm leading-relaxed text-cocoa-500">
            {siteConfig.description}
          </p>
        </div>

        <nav
          className="flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Footer links"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-cocoa-600 transition-colors hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/track-order"
            className="text-sm text-cocoa-600 transition-colors hover:text-brand-700"
          >
            Track order
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-cocoa-600 transition-colors hover:text-brand-700"
          >
            Privacy Notice
          </Link>
          <WhatsAppFooterLink />
          <Link
            href="/login"
            className="text-sm text-cocoa-500 transition-colors hover:text-brand-700"
          >
            Owner login
          </Link>
        </nav>
      </div>

      <div className="border-t border-cocoa-900/5">
        <div className="container-page py-5 text-xs text-cocoa-500">
          &copy; {year} {siteConfig.brand}. All rights reserved.
        </div>
      </div>

      <WhatsAppFloatingButton />
    </footer>
  );
}
