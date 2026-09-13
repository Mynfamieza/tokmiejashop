import { StatCard } from "@/components/dashboard/stat-card";
import type { FinanceSummary } from "@/lib/finance";
import { formatPrice } from "@/lib/utils";

export function FinanceSummaryCards({ summary }: { summary: FinanceSummary }) {
  return (
    <section aria-label="Financial summary">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Today's sales"
          value={formatPrice(summary.todaySales)}
        />
        <StatCard
          label="This month's sales"
          value={formatPrice(summary.monthSales)}
          hint="Excludes cancelled"
        />
        <StatCard
          label="Total orders"
          value={summary.totalOrders}
          hint="All time"
        />
        <StatCard
          label="Cash in"
          value={formatPrice(summary.cashIn)}
          hint="Paid this month"
        />
        <StatCard
          label="Cash out"
          value={formatPrice(summary.cashOut)}
          hint="Expenses this month"
        />
        <StatCard
          label="Estimated profit"
          value={formatPrice(summary.estimatedProfit)}
          hint="This month"
        />
      </div>
    </section>
  );
}

export function FinanceBreakdown({ summary }: { summary: FinanceSummary }) {
  return (
    <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-cocoa-900">
        Estimated profit (this month)
      </h2>

      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-cocoa-500">Sales</dt>
          <dd className="font-medium text-cocoa-900">
            {formatPrice(summary.monthSales)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-cocoa-500">Product costs (estimated)</dt>
          <dd className="font-medium text-cocoa-900">
            − {formatPrice(summary.cogs)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-cocoa-500">Expenses</dt>
          <dd className="font-medium text-cocoa-900">
            − {formatPrice(summary.cashOut)}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-cocoa-900/10 pt-2">
          <dt className="font-display text-base font-semibold text-cocoa-900">
            Estimated profit
          </dt>
          <dd className="font-display text-lg font-semibold text-brand-700">
            {formatPrice(summary.estimatedProfit)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-cocoa-500">
        Estimated only, based on each product&apos;s estimated cost per unit and
        the expenses you record. This is not a full accounting system.
      </p>
    </section>
  );
}
