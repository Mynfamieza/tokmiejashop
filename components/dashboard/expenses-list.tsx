import { ExpenseDeleteButton } from "@/components/dashboard/expense-delete-button";
import { Badge } from "@/components/ui/badge";
import {
  expenseCategoryLabel,
  formatExpenseDate,
  type Expense,
} from "@/lib/finance";
import { formatPrice } from "@/lib/utils";

export function ExpensesList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-panel border border-cocoa-900/10 bg-white px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-cocoa-900">
          No expenses recorded
        </p>
        <p className="text-sm text-cocoa-500">
          Use the form above to record your first expense.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-panel border border-cocoa-900/10 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cocoa-900/10 text-xs uppercase tracking-wide text-cocoa-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-900/8">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3 text-cocoa-600">
                  {formatExpenseDate(expense.expense_date)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">
                    {expenseCategoryLabel(expense.category)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-cocoa-800">
                  {expense.description}
                </td>
                <td className="px-4 py-3 font-medium text-cocoa-900">
                  {formatPrice(expense.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ExpenseDeleteButton
                      id={expense.id}
                      description={expense.description}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="rounded-panel border border-cocoa-900/10 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-cocoa-900">
                  {expense.description}
                </p>
                <p className="mt-0.5 text-xs text-cocoa-500">
                  {formatExpenseDate(expense.expense_date)}
                </p>
              </div>
              <ExpenseDeleteButton
                id={expense.id}
                description={expense.description}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <Badge variant="neutral">
                {expenseCategoryLabel(expense.category)}
              </Badge>
              <span className="text-sm font-semibold text-cocoa-900">
                {formatPrice(expense.amount)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
