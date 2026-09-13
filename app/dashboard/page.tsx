import type { Metadata } from "next";
import Link from "next/link";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { OrdersList } from "@/components/dashboard/orders-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDashboardStats, getRecentOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const [{ stats, error }, { orders, error: recentError }] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
  ]);

  if (error || !stats) {
    return (
      <DashboardMessage
        title="Could not load dashboard"
        description={error ?? "Please try again."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-cocoa-900">
          Overview
        </h1>
        <p className="text-cocoa-500">A snapshot of your store orders.</p>
      </header>

      <section aria-label="Order statistics">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total orders" value={stats.total} />
          <StatCard label="Pending" value={stats.byStatus.pending} />
          <StatCard label="Confirmed" value={stats.byStatus.confirmed} />
          <StatCard label="Preparing" value={stats.byStatus.preparing} />
          <StatCard label="Completed" value={stats.byStatus.completed} />
          <StatCard label="Cancelled" value={stats.byStatus.cancelled} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Today's orders" value={stats.todayOrders} />
        <StatCard
          label="Today's sales"
          value={formatPrice(stats.todaySales)}
          hint="Excludes cancelled orders"
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-cocoa-900">
            Recent orders
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            View all
          </Link>
        </div>

        {recentError ? (
          <DashboardMessage
            title="Could not load recent orders"
            description={recentError}
          />
        ) : (
          <OrdersList orders={orders} />
        )}
      </section>
    </div>
  );
}
