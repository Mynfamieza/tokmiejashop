import Link from "next/link";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { StatusControl } from "@/components/dashboard/status-control";
import type { OrderWithItems } from "@/lib/orders";
import { formatOrderDate } from "@/lib/order-status";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/delivery";
import { formatPrice } from "@/lib/utils";

export function OrderDetail({ order }: { order: OrderWithItems }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
        >
          ← Back to orders
        </Link>
      </div>

      <div className="flex flex-col gap-3 rounded-panel border border-cocoa-900/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-xl font-semibold text-cocoa-900">
              {order.order_number}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-cocoa-500">
            Placed {formatOrderDate(order.created_at)}
          </p>
        </div>
      </div>

      <StatusControl
        orderNumber={order.order_number}
        currentStatus={order.status}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-cocoa-900">
              Customer
            </h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <DetailRow label="Name" value={order.customer_name} />
              <DetailRow label="Phone" value={order.customer_phone} />
              {order.customer_email ? (
                <DetailRow label="Email" value={order.customer_email} />
              ) : null}
              {order.delivery_address ? (
                <DetailRow
                  label="Delivery address"
                  value={order.delivery_address}
                />
              ) : null}
              {order.location_pin ? (
                <DetailRow label="Location pin" value={order.location_pin} />
              ) : null}
              {order.notes ? (
                <DetailRow label="Notes" value={order.notes} />
              ) : null}
            </dl>
          </section>

          <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-cocoa-900">
              Payment
            </h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <DetailRow
                label="Payment method"
                value={
                  order.payment_method === "pay_now"
                    ? "Pay Now — ToyyibPay"
                    : paymentMethodLabel(order.payment_method)
                }
              />
              <DetailRow
                label="Payment status"
                value={paymentStatusLabel(order.payment_status)}
              />
              {order.toyyibpay_bill_code ? (
                <DetailRow
                  label="ToyyibPay bill code"
                  value={order.toyyibpay_bill_code}
                />
              ) : null}
              {order.toyyibpay_refno ? (
                <DetailRow
                  label="ToyyibPay reference no"
                  value={order.toyyibpay_refno}
                />
              ) : null}
              {order.toyyibpay_transaction_id ? (
                <DetailRow
                  label="ToyyibPay transaction ID"
                  value={order.toyyibpay_transaction_id}
                />
              ) : null}
              {order.payment_paid_at ? (
                <DetailRow
                  label="Paid at"
                  value={formatOrderDate(order.payment_paid_at)}
                />
              ) : null}
            </dl>
          </section>
        </div>

        <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-cocoa-900">
            Totals
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
                {order.delivery_fee === 0
                  ? "FREE"
                  : formatPrice(order.delivery_fee)}
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
          <p className="mt-3 text-xs leading-relaxed text-cocoa-400">
            Standard delivery RM6 · FREE for orders of 5 or more jars.
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-panel border border-cocoa-900/10 bg-white">
        <h2 className="border-b border-cocoa-900/10 px-5 py-4 font-display text-lg font-semibold text-cocoa-900 sm:px-6">
          Items
        </h2>
        <ul className="divide-y divide-cocoa-900/8">
          {order.order_items.length === 0 ? (
            <li className="px-5 py-6 text-sm text-cocoa-500 sm:px-6">
              No items recorded for this order.
            </li>
          ) : (
            order.order_items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cocoa-900">
                    {item.product_name}
                  </p>
                  <p className="mt-0.5 text-xs text-cocoa-400">
                    {item.quantity} × {formatPrice(item.unit_price)}
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
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-cocoa-400">
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-line text-cocoa-800">{value}</dd>
    </div>
  );
}
