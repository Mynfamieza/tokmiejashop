import {
  computeFinanceSummary,
  type Expense,
  type FinanceExpenseRow,
  type FinanceItemRow,
  type FinanceOrderRow,
  type FinanceProductRow,
  type FinanceSummary,
} from "@/lib/finance";
import { createClient } from "@/lib/supabase/server";

const EXPENSES_ERROR =
  "Unable to load expenses right now. Please try again.";
const SUMMARY_ERROR =
  "Unable to load financial data right now. Please try again.";

export async function getExpenses(): Promise<{
  expenses: Expense[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .select("id, amount, description, category, expense_date, created_at")
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) return { expenses: [], error: EXPENSES_ERROR };
    return { expenses: (data ?? []) as Expense[] };
  } catch {
    return { expenses: [], error: EXPENSES_ERROR };
  }
}

export async function getFinanceSummary(): Promise<{
  summary: FinanceSummary | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const [ordersResult, itemsResult, productsResult, expensesResult] =
      await Promise.all([
        supabase
          .from("orders")
          .select("id, total, status, payment_status, created_at"),
        supabase.from("order_items").select("order_id, product_id, quantity"),
        supabase.from("products").select("id, cost_price"),
        supabase.from("expenses").select("amount, expense_date"),
      ]);

    if (
      ordersResult.error ||
      itemsResult.error ||
      productsResult.error ||
      expensesResult.error
    ) {
      return { summary: null, error: SUMMARY_ERROR };
    }

    const summary = computeFinanceSummary({
      orders: (ordersResult.data ?? []) as FinanceOrderRow[],
      items: (itemsResult.data ?? []) as FinanceItemRow[],
      products: (productsResult.data ?? []) as FinanceProductRow[],
      expenses: (expensesResult.data ?? []) as FinanceExpenseRow[],
    });

    return { summary };
  } catch {
    return { summary: null, error: SUMMARY_ERROR };
  }
}
