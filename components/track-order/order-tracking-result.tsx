import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { CheckIcon } from "@/components/icons";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/delivery";
import {
  ORDER_FLOW,
  ORDER_STATUS_LABELS,
  formatOrderDate,
} from "@/lib/order-status";
import type { TrackedOrder } from "@/lib/order-tracking";
import { cn, formatPrice } from "@/lib/utils";

export function OrderTrackingResult({ order }: { order: TrackedOrder }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-cocoa-500">
              Order number
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-cocoa-900">
              {order.orderNumber}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-2 text-sm text-cocoa-500">
          Placed {formatOrderDate(order.createdAt)}
        </p>
      </section>

      <StatusTimeline status={order.status} />

      {order.courier || order.trackingNumber ? (
        <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-cocoa-900">
            Courier
          </h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            {order.courier ? (
              <DetailRow label="Courier" value={order.courier} />
            ) : null}
            {order.trackingNumber ? (
              <DetailRow
                label="Tracking number"
                value={order.trackingNumber}
              />
            ) : null}
          </dl>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-panel border border-cocoa-900/10 bg-white">
        <h2 className="border-b border-cocoa-900/10 px-5 py-4 font-display text-lg font-semibold text-cocoa-900 sm:px-6">
          Items
        </h2>
        <ul className="divide-y divide-cocoa-900/8">
          {order.items.length === 0 ? (
            <li className="px-5 py-6 text-sm text-cocoa-500 sm:px-6">
              No items recorded for this order.
            </li>
          ) : (
            order.items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cocoa-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-cocoa-500">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-cocoa-900">
                  {formatPrice(item.subtotal)}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-cocoa-900">
            Payment
          </h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <DetailRow
              label="Method"
              value={paymentMethodLabel(order.paymentMethod)}
            />
            <DetailRow
              label="Status"
              value={paymentStatusLabel(order.paymentStatus)}
            />
          </dl>
        </section>

        <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-cocoa-900">
            Total
          </h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-cocoa-500">Subtotal</dt>
              <dd className="font-medium text-cocoa-900">
                {formatPrice(order.subtotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-cocoa-500">Delivery</dt>
              <dd className="font-medium text-cocoa-900">
                {order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}
              </dd>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-cocoa-900/10 pt-2">
              <dt className="font-display text-base font-semibold text-cocoa-900">
                Total
              </dt>
              <dd className="font-display text-lg font-semibold text-brand-700">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-cocoa-900">
          Order status
        </h2>
        <p className="mt-2 text-sm text-cocoa-600">
          This order was cancelled. If you have any questions, please contact us.
        </p>
      </section>
    );
  }

  const currentIndex = ORDER_FLOW.indexOf(
    status as (typeof ORDER_FLOW)[number],
  );

  return (
    <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-cocoa-900">
        Order status
      </h2>

      <ol className="mt-5 flex flex-col">
        {ORDER_FLOW.map((step, index) => {
          const done = currentIndex > index;
          const current = currentIndex === index;
          const last = index === ORDER_FLOW.length - 1;

          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                    done
                      ? "bg-brand-700 text-cream-50"
                      : current
                        ? "bg-mango-400 text-cocoa-950 ring-4 ring-mango-100"
                        : "bg-cream-200 text-cocoa-500",
                  )}
                >
                  {done ? (
                    <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                {!last ? (
                  <span
                    aria-hidden
                    className={cn(
                      "my-1 w-px flex-1",
                      done ? "bg-brand-700/40" : "bg-cocoa-900/10",
                    )}
                  />
                ) : null}
              </div>

              <span
                className={cn(
                  "text-sm",
                  last ? "pb-0" : "pb-5",
                  current
                    ? "font-semibold text-cocoa-900"
                    : done
                      ? "text-cocoa-700"
                      : "text-cocoa-500",
                )}
              >
                {ORDER_STATUS_LABELS[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-cocoa-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-cocoa-800">{value}</dd>
    </div>
  );
}
