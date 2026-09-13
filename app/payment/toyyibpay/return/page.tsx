import type { Metadata } from "next";
import Link from "next/link";
import { AlertIcon, CheckIcon } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  getToyyibpayBillStatus,
  isToyyibpayConfigured,
  mapToyyibpayStatus,
} from "@/lib/toyyibpay";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment status",
  description: "Status pembayaran TokMieja.",
};

type SearchParams = {
  status_id?: string;
  billcode?: string;
  order_id?: string;
};

type DisplayStatus = "success" | "pending" | "failed";

const COPY: Record<DisplayStatus, { title: string; body: string }> = {
  success: {
    title: "Payment successful",
    body: "Thank you. Your payment has been received and your order is confirmed.",
  },
  pending: {
    title: "Payment is still being confirmed.",
    body: "We are waiting for ToyyibPay to confirm your payment. You can refresh this page in a moment.",
  },
  failed: {
    title: "Payment not completed",
    body: "No payment was taken. You can try again, or contact us if the problem continues.",
  },
};

export default async function ToyyibpayReturnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { billcode, order_id } = await searchParams;

  // The return URL is used for DISPLAY only. We re-check the real status from
  // ToyyibPay server-side; the order is marked paid only by the verified
  // callback. Query parameters alone are never trusted.
  let display: DisplayStatus = "pending";
  let orderNumber = order_id?.trim() || null;

  if (billcode && isToyyibpayConfigured()) {
    const result = await getToyyibpayBillStatus(billcode);
    if (result.ok) {
      const mapped = mapToyyibpayStatus(result.status);
      display = mapped === "paid" ? "success" : mapped;
      if (result.referenceNo) orderNumber = result.referenceNo;
    }
  }

  const { title, body } = COPY[display];

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="container-page flex flex-1 flex-col items-center justify-center py-16">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 text-center">
          <span
            className={cn(
              "grid h-14 w-14 place-items-center rounded-full",
              display === "success"
                ? "bg-emerald-50 text-emerald-700"
                : display === "failed"
                  ? "bg-brand-50 text-brand-700"
                  : "bg-mango-100 text-mango-600",
            )}
          >
            {display === "success" ? (
              <CheckIcon className="h-7 w-7" strokeWidth={2.2} />
            ) : display === "failed" ? (
              <AlertIcon className="h-7 w-7" />
            ) : (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </span>

          <h1 className="font-display text-2xl font-semibold text-cocoa-900 sm:text-3xl">
            {title}
          </h1>
          <p className="text-cocoa-500">{body}</p>

          {orderNumber ? (
            <div className="w-full rounded-panel border border-cocoa-900/10 bg-cream-100 px-5 py-4">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-cocoa-400">
                Order number
              </span>
              <p className="mt-1 font-display text-lg font-semibold text-cocoa-900">
                {orderNumber}
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            {orderNumber ? (
              <Link
                href={`/order-confirmation/${encodeURIComponent(orderNumber)}`}
                className={buttonVariants({ size: "lg" })}
              >
                View order
              </Link>
            ) : null}
            <Link
              href="/products"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Back to shop
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
