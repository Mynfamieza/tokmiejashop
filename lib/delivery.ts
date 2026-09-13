/**
 * Phase 6 delivery + payment rules (pure, shared by client and server).
 *
 * The client uses these for display/eligibility only. The server (Server
 * Action + the create_order database function) recalculates everything and is
 * the source of truth.
 */

export type PaymentMethod = "pay_now" | "cod";

export const PAYMENT_METHODS: PaymentMethod[] = ["pay_now", "cod"];

/** Standard Pay Now delivery fee (RM). */
export const DELIVERY_FEE = 6;

/** COD delivery fee (RM). */
export const COD_DELIVERY_FEE = 2;

/** Orders with this many jars/bottles or more get free delivery. */
export const FREE_DELIVERY_MIN_QUANTITY = 5;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pay_now: "Pay Now",
  cod: "COD / Pay by Hand",
};

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" && (PAYMENT_METHODS as string[]).includes(value)
  );
}

export function paymentMethodLabel(value: string): string {
  return isPaymentMethod(value)
    ? PAYMENT_METHOD_LABELS[value]
    : value || "—";
}

export function paymentStatusLabel(value: string): string {
  const labels = PAYMENT_STATUS_LABELS as Record<string, string>;
  return labels[value] ?? (value || "—");
}

/** New orders: pay_now is unpaid (no gateway yet); COD is pending on handover. */
export function paymentStatusFor(method: PaymentMethod): PaymentStatus {
  return method === "cod" ? "pending" : "unpaid";
}

export function totalQuantity(items: Array<{ quantity: number }>): number {
  return items.reduce(
    (sum, item) =>
      sum + (Number.isFinite(item.quantity) ? item.quantity : 0),
    0,
  );
}

export function isFreeDelivery(quantity: number): boolean {
  return quantity >= FREE_DELIVERY_MIN_QUANTITY;
}

export function calculateDeliveryFee(
  quantity: number,
  method: PaymentMethod = "pay_now",
): number {
  if (isFreeDelivery(quantity)) return 0;
  return method === "cod" ? COD_DELIVERY_FEE : DELIVERY_FEE;
}

/**
 * Conservative Kulim (Kedah) check based on the address text.
 * Isolated on purpose so it can be replaced by real geocoding later.
 * Requires the explicit word "kulim"; ambiguous addresses are NOT Kulim.
 */
const KULIM_PATTERN = /(^|[^a-z0-9])kulim([^a-z0-9]|$)/i;

export function isKulimAddress(address: string): boolean {
  if (typeof address !== "string") return false;
  return KULIM_PATTERN.test(address.trim());
}

/** Optional Google Maps link / pin URL. Empty is allowed; must be http(s). */
export function isValidLocationPin(value: string): boolean {
  const trimmed = (value ?? "").trim();
  if (trimmed.length === 0) return true;
  if (trimmed.length > 500) return false;
  return /^https?:\/\/.+/i.test(trimmed);
}
