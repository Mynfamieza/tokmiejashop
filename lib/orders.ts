import {
  computeDashboardStats,
  type DashboardStats,
  type OrderStatRow,
} from "@/lib/order-status";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

export type OrderListItem = Pick<
  Order,
  | "id"
  | "order_number"
  | "customer_name"
  | "customer_phone"
  | "total"
  | "status"
  | "created_at"
>;

export type OrderWithItems = Order & { order_items: OrderItem[] };

const LIST_COLUMNS =
  "id, order_number, customer_name, customer_phone, total, status, created_at";

const ORDERS_ERROR = "Unable to load orders right now. Please try again.";
const ORDER_ERROR = "Unable to load this order right now. Please try again.";
const STATS_ERROR =
  "Unable to load dashboard data right now. Please try again.";

export async function getOrders(
  status?: OrderStatus | null,
): Promise<{ orders: OrderListItem[]; error?: string }> {
  try {
    const supabase = await createClient();
    let query = supabase.from("orders").select(LIST_COLUMNS);
    if (status) query = query.eq("status", status);
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) return { orders: [], error: ORDERS_ERROR };
    return { orders: (data ?? []) as OrderListItem[] };
  } catch {
    return { orders: [], error: ORDERS_ERROR };
  }
}

export async function getRecentOrders(
  limit = 5,
): Promise<{ orders: OrderListItem[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(LIST_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return { orders: [], error: ORDERS_ERROR };
    return { orders: (data ?? []) as OrderListItem[] };
  } catch {
    return { orders: [], error: ORDERS_ERROR };
  }
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<{ order: OrderWithItems | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error) return { order: null, error: ORDER_ERROR };
    return { order: (data as OrderWithItems | null) ?? null };
  } catch {
    return { order: null, error: ORDER_ERROR };
  }
}

export async function getDashboardStats(): Promise<{
  stats: DashboardStats | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("status, total, created_at");

    if (error) return { stats: null, error: STATS_ERROR };
    return { stats: computeDashboardStats((data ?? []) as OrderStatRow[]) };
  } catch {
    return { stats: null, error: STATS_ERROR };
  }
}
