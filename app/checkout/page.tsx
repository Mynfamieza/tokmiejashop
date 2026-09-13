import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CheckoutFlow } from "./checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pesanan TokMieja anda.",
};

export default function CheckoutPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-8 sm:py-12">
        <header className="mb-8 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            Checkout
          </p>
          <h1 className="font-display text-2xl font-semibold text-cocoa-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="max-w-xl text-cocoa-500">
            Enter your delivery details, review your order, then confirm.
          </p>
        </header>

        <CheckoutFlow />
      </main>

      <SiteFooter />
    </div>
  );
}
