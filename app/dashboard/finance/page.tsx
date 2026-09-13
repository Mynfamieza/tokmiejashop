import type { Metadata } from "next";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { ExpenseForm } from "@/components/dashboard/expense-form";
import { ExpensesList } from "@/components/dashboard/expenses-list";
import {
  FinanceBreakdown,
  FinanceSummaryCards,
} from "@/components/dashboard/finance-summary";
import { getExpenses, getFinanceSummary } from "@/lib/finance-data";

export const metadata: Metadata = { title: "Finance" };
export const dynamic = "force-dynamic";

export default async function DashboardFinancePage() {
  const [{ summary, error }, { expenses, error: expensesError }] =
    await Promise.all([getFinanceSummary(), getExpenses()]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-cocoa-900">
          Finance
        </h1>
        <p className="text-cocoa-500">
          Sales, expenses and an estimate of profit.
        </p>
      </header>

      {error || !summary ? (
        <DashboardMessage
          title="Could not load financial data"
          description={error ?? "Please try again."}
        />
      ) : (
        <>
          <FinanceSummaryCards summary={summary} />
          <FinanceBreakdown summary={summary} />
        </>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-cocoa-900">
          Add expense
        </h2>
        <ExpenseForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-cocoa-900">
          Expenses
        </h2>
        {expensesError ? (
          <DashboardMessage
            title="Could not load expenses"
            description={expensesError}
          />
        ) : (
          <ExpensesList expenses={expenses} />
        )}
      </section>
    </div>
  );
}
