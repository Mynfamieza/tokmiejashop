"use client";

import Link from "next/link";
import { OrderSummary } from "@/components/checkout/order-summary";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { loadOrderConfirmation } from "@/lib/checkout";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/delivery";
import { useIsClient } from "@/lib/use-is-client";

export function OrderConfirmationView({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return <ConfirmationSkeleton />;
  }

  const order = loadOrderConfirmation(orderNumber);
  if (!order) {
    return <MissingConfirmation orderNumber={orderNumber} />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
          <CheckIcon className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-cocoa-900 sm:text-3xl">
          Order confirmed
        </h1>
        <p className="text-cocoa-500">
          Thank you{order.customerName ? `, ${order.customerName}` : ""}. We have
          received your order.
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-panel border border-cocoa-900/10 bg-cream-100 px-5 py-4 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-cocoa-400">
          Order number
        </span>
        <span className="font-display text-xl font-semibold text-cocoa-900">
          {order.orderNumber}
        </span>
      </div>

      <OrderSummary
        title="Order details"
        items={order.items}
        subtotal={order.subtotal}
        deliveryFee={order.deliveryFee}
        total={order.total}
      />

      <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-cocoa-900">
          Delivery &amp; payment
        </h2>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <ConfirmRow
            label="Delivery address"
            value={order.deliveryAddress || "—"}
          />
          {order.locationPin ? (
            <ConfirmRow label="Location pin" value={order.locationPin} />
          ) : null}
          <ConfirmRow
            label="Payment method"
            value={paymentMethodLabel(order.paymentMethod)}
          />
          <ConfirmRow
            label="Payment status"
            value={paymentStatusLabel(order.paymentStatus)}
          />
        </dl>
      </section>

      <p className="text-sm leading-relaxed text-cocoa-500">
        {order.paymentMethod === "cod"
          ? "COD / Pay by Hand — please prepare payment when your order is handed over. We will contact you to confirm delivery."
          : "Payment pending — online payment will be completed in a later step. We will contact you to confirm delivery."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className={buttonVariants({ size: "lg" })}
        >
          Continue shopping
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-cocoa-400">
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-line text-cocoa-800">{value}</dd>
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 animate-pulse rounded-full bg-cream-100" />
        <div className="h-8 w-56 animate-pulse rounded bg-cream-100" />
        <div className="h-4 w-72 animate-pulse rounded bg-cream-100" />
      </div>
      <div className="h-20 animate-pulse rounded-panel bg-cream-100" />
      <div className="h-64 animate-pulse rounded-panel bg-cream-100" />
    </div>
  );
}

function MissingConfirmation({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
      <h1 className="font-display text-2xl font-semibold text-cocoa-900">
        Confirmation not available
      </h1>
      <p className="text-cocoa-500">
        We could not find the details for order{" "}
        <span className="font-medium text-cocoa-700">{orderNumber}</span> in
        this browser session. If you just placed the order, try opening the
        confirmation link from the same browser.
      </p>
      <Link
        href="/products"
        className={buttonVariants({ variant: "outline", size: "lg" })}
      >
        Back to shop
      </Link>
    </div>
  );
}
