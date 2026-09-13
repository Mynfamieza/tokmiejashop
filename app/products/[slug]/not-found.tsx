import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          404
        </p>
        <h1 className="font-display text-2xl font-semibold text-cocoa-900 sm:text-3xl">
          Product not found
        </h1>
        <p className="max-w-md text-cocoa-500">
          The product you are looking for is not available.
        </p>
        <Link
          href="/products"
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          Back to shop
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
