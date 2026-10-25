import Link from "next/link";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import type { OrderListItem } from "@/lib/orders";
import { formatOrderDate } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";

export function OrdersList({
  orders,
  filtered = false,
}: {
  orders: OrderListItem[];
  filtered?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-panel border border-cocoa-900/10 bg-white px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-cocoa-900">
          {filtered ? "No orders with this status" : "No orders yet"}
        </p>
        <p className="text-sm text-cocoa-500">
          {filtered
            ? "Try a different status filter."
            : "New customer orders will appear here."}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-cocoa-900/8 overflow-hidden rounded-panel border border-cocoa-900/10 bg-white">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/dashboard/orders/${encodeURIComponent(order.order_number)}`}
            className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-cream-50"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-cocoa-900">
                  {order.order_number}
                </span>
                <OrderStatusBadge
                  status={order.status}
                  className="sm:hidden"
                />
              </div>
              <p className="mt-0.5 text-xs text-cocoa-400">
                {formatOrderDate(order.created_at)}
              </p>
              <p className="mt-1 truncate text-sm text-cocoa-700">
                {order.customer_name} · {order.customer_phone}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <OrderStatusBadge
                status={order.status}
                className="hidden sm:inline-flex"
              />
              <span className="text-sm font-semibold text-cocoa-900">
                {formatPrice(order.total)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
