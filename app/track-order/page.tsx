import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrackOrderForm } from "./track-order-form";

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Check the status of your TokMieja order using your order number and phone number.",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-10 sm:py-14">
        <header className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            Order tracking
          </p>
          <h1 className="font-display text-2xl font-semibold text-cocoa-900 sm:text-3xl">
            Track your order
          </h1>
          <p className="text-cocoa-500">
            Enter your order number and the phone number you used at checkout.
          </p>
        </header>

        <div className="mx-auto mt-8 w-full max-w-xl">
          <TrackOrderForm defaultOrderNumber={order?.trim() ?? ""} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
