import type { OrderStatus } from "@/lib/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-mango-100 text-mango-600",
  confirmed: "bg-brand-50 text-brand-700",
  preparing: "bg-cocoa-100 text-cocoa-700",
  shipped: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-cocoa-100 text-cocoa-500",
};

/** Recommended happy-path flow (cancellation is allowed from the control). */
export const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "completed",
];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as string[]).includes(value)
  );
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(status);
  if (index === -1 || index === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kuala_Lumpur",
  dateStyle: "medium",
  timeStyle: "short",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kuala_Lumpur",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMATTER.format(date);
}

export function orderDayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return DAY_FORMATTER.format(date);
}

export function todayDayKey(now: Date = new Date()): string {
  return DAY_FORMATTER.format(now);
}

export type OrderStatRow = {
  status: OrderStatus;
  total: number;
  created_at: string;
};

export type DashboardStats = {
  total: number;
  byStatus: Record<OrderStatus, number>;
  todayOrders: number;
  todaySales: number;
};

export function computeDashboardStats(
  rows: OrderStatRow[],
  now: Date = new Date(),
): DashboardStats {
  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>;

  const today = todayDayKey(now);
  let todayOrders = 0;
  let todaySales = 0;

  for (const row of rows) {
    if (isOrderStatus(row.status)) {
      byStatus[row.status] += 1;
    }

    if (orderDayKey(row.created_at) === today) {
      todayOrders += 1;
      if (row.status !== "cancelled") {
        todaySales += Number(row.total) || 0;
      }
    }
  }

  return { total: rows.length, byStatus, todayOrders, todaySales };
}
