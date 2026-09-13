/**
 * Phase 10 finance helpers (pure, shared by client and server).
 *
 * These produce a lightweight ESTIMATE for the owner only:
 *   Estimated profit = sales - estimated product costs (COGS) - recorded expenses
 * It is not a full accounting system.
 */

export const EXPENSE_CATEGORIES = [
  "ingredients",
  "packaging",
  "delivery",
  "gas",
  "marketing",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  ingredients: "Ingredients",
  packaging: "Packaging",
  delivery: "Delivery",
  gas: "Gas",
  marketing: "Marketing",
  other: "Other",
};

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return (
    typeof value === "string" &&
    (EXPENSE_CATEGORIES as readonly string[]).includes(value)
  );
}

export function expenseCategoryLabel(value: string): string {
  return isExpenseCategory(value)
    ? EXPENSE_CATEGORY_LABELS[value]
    : value || "Other";
}

export type Expense = {
  id: string;
  amount: number;
  description: string;
  category: string;
  expense_date: string;
  created_at: string;
};

export type ExpenseInput = {
  amount: string;
  description: string;
  category: string;
  expenseDate: string;
};

export type ExpenseFieldErrors = {
  amount?: string;
  description?: string;
  category?: string;
  expenseDate?: string;
};

export type NormalizedExpense = {
  amount: number;
  description: string;
  category: ExpenseCategory;
  expense_date: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateExpenseInput(input: ExpenseInput): {
  values: NormalizedExpense;
  errors: ExpenseFieldErrors;
} {
  const errors: ExpenseFieldErrors = {};

  const amountRaw = String(input.amount ?? "").trim();
  const amount = Number(amountRaw);
  if (!amountRaw) errors.amount = "Amount is required.";
  else if (!Number.isFinite(amount) || amount <= 0)
    errors.amount = "Amount must be more than 0.";
  else if (amount > 9999999.99) errors.amount = "Amount is too large.";

  const description = (input.description ?? "").trim();
  if (!description) errors.description = "Description is required.";
  else if (description.length > 200)
    errors.description = "Description is too long.";

  const category = (input.category ?? "").trim();
  if (!isExpenseCategory(category)) errors.category = "Please choose a category.";

  const expenseDate = (input.expenseDate ?? "").trim();
  if (!expenseDate) errors.expenseDate = "Date is required.";
  else if (!DATE_PATTERN.test(expenseDate) || Number.isNaN(Date.parse(expenseDate)))
    errors.expenseDate = "Please enter a valid date.";

  return {
    values: {
      amount: Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0,
      description,
      category: isExpenseCategory(category) ? category : "other",
      expense_date: expenseDate,
    },
    errors,
  };
}

export function hasExpenseErrors(errors: ExpenseFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kuala_Lumpur",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YYYY-MM-DD in Malaysia time. */
export function dayKeyKL(date: Date = new Date()): string {
  return DATE_FORMATTER.format(date);
}

/** YYYY-MM in Malaysia time. */
export function monthKeyKL(date: Date = new Date()): string {
  return DATE_FORMATTER.format(date).slice(0, 7);
}

const EXPENSE_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

/** Format a `YYYY-MM-DD` expense date for display. */
export function formatExpenseDate(value: string): string {
  if (!DATE_PATTERN.test(value)) return value || "—";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return EXPENSE_DATE_FORMATTER.format(date);
}

export type FinanceOrderRow = {
  id: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export type FinanceItemRow = {
  order_id: string;
  product_id: string | null;
  quantity: number;
};

export type FinanceProductRow = {
  id: string;
  cost_price: number;
};

export type FinanceExpenseRow = {
  amount: number;
  expense_date: string;
};

export type FinanceSummary = {
  todaySales: number;
  monthSales: number;
  totalOrders: number;
  cashIn: number;
  cashOut: number;
  cogs: number;
  estimatedProfit: number;
};

export function computeFinanceSummary(args: {
  orders: FinanceOrderRow[];
  items: FinanceItemRow[];
  products: FinanceProductRow[];
  expenses: FinanceExpenseRow[];
  now?: Date;
}): FinanceSummary {
  const { orders, items, products, expenses } = args;
  const now = args.now ?? new Date();
  const today = dayKeyKL(now);
  const month = monthKeyKL(now);

  const costById = new Map(
    products.map((product) => [product.id, Number(product.cost_price) || 0]),
  );

  let todaySales = 0;
  let monthSales = 0;
  let cashIn = 0;
  const monthOrderIds = new Set<string>();

  for (const order of orders) {
    const total = Number(order.total) || 0;
    const created = new Date(order.created_at);
    const day = Number.isNaN(created.getTime()) ? "" : dayKeyKL(created);
    const mon = day.slice(0, 7);

    if (order.status !== "cancelled") {
      if (day === today) todaySales += total;
      if (mon === month) {
        monthSales += total;
        monthOrderIds.add(order.id);
      }
    }

    if (order.payment_status === "paid" && mon === month) {
      cashIn += total;
    }
  }

  let cogs = 0;
  for (const item of items) {
    if (item.product_id && monthOrderIds.has(item.order_id)) {
      cogs += (Number(item.quantity) || 0) * (costById.get(item.product_id) ?? 0);
    }
  }

  let cashOut = 0;
  for (const expense of expenses) {
    if (String(expense.expense_date).slice(0, 7) === month) {
      cashOut += Number(expense.amount) || 0;
    }
  }

  return {
    todaySales,
    monthSales,
    totalOrders: orders.length,
    cashIn,
    cashOut,
    cogs,
    estimatedProfit: monthSales - cogs - cashOut,
  };
}
