import type { Metadata } from "next";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { OrderFilters } from "@/components/dashboard/order-filters";
import { OrdersList } from "@/components/dashboard/orders-list";
import { getOrders } from "@/lib/orders";
import { ORDER_STATUS_LABELS, isOrderStatus } from "@/lib/order-status";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const selected = isOrderStatus(status) ? status : null;
  const { orders, error } = await getOrders(selected);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-cocoa-900">
          Orders
        </h1>
        <p className="text-cocoa-500">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
          {selected ? ` · ${ORDER_STATUS_LABELS[selected]}` : ""}
        </p>
      </header>

      <OrderFilters active={selected} />

      {error ? (
        <DashboardMessage title="Could not load orders" description={error} />
      ) : (
        <OrdersList orders={orders} filtered={Boolean(selected)} />
      )}
    </div>
  );
}
