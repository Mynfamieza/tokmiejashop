"use client";

import { OrderSummary } from "@/components/checkout/order-summary";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/delivery";
import type { CustomerFormValues, OrderSummaryItem } from "@/lib/checkout";
import { cn, formatPrice } from "@/lib/utils";

export function ReviewOrder({
  values,
  items,
  subtotal,
  deliveryFee,
  total,
  paymentMethod,
  onBack,
  onConfirm,
  submitting,
  error,
}: {
  values: CustomerFormValues;
  items: OrderSummaryItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-cocoa-900">
            Customer details
          </h2>
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800 disabled:opacity-50"
          >
            Back to edit
          </button>
        </div>

        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <DetailRow label="Name" value={values.name} />
          <DetailRow label="Phone" value={values.phone} />
          {values.email.trim() ? (
            <DetailRow label="Email" value={values.email} />
          ) : null}
          <DetailRow
            label="Delivery address"
            value={values.address}
            className="sm:col-span-2"
          />
          {values.notes.trim() ? (
            <DetailRow
              label="Notes"
              value={values.notes}
              className="sm:col-span-2"
            />
          ) : null}
        </dl>
      </section>

      <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-cocoa-900">
          Delivery &amp; payment
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <DetailRow
            label="Delivery"
            value={deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
          />
          <DetailRow
            label="Payment method"
            value={PAYMENT_METHOD_LABELS[paymentMethod]}
          />
          {values.locationPin.trim() ? (
            <DetailRow
              label="Location pin"
              value={values.locationPin}
              className="sm:col-span-2"
            />
          ) : null}
        </dl>
      </section>

      <OrderSummary
        items={items}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
      />

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {paymentMethod === "pay_now" ? (
        <p className="text-sm leading-relaxed text-cocoa-500" lang="ms">
          Sahkan pesanan dahulu. Kod DuitNow QR dan jumlah bayaran akan
          dipaparkan pada halaman pengesahan. Sila masukkan jumlah yang tepat
          dalam aplikasi bank anda. Bayaran disahkan secara manual oleh TokMieja.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
        <Button
          type="button"
          size="lg"
          onClick={onConfirm}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Placing order...
            </>
          ) : (
            "Confirm Order"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          Back to edit
        </Button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-cocoa-400">
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-line text-cocoa-800">{value}</dd>
    </div>
  );
}
