/**
 * Customer order tracking helpers.
 *
 * The order is only ever revealed when BOTH the order number and the phone
 * number used at checkout match (verified server-side by the
 * `get_order_tracking` database function). The response is sanitized and never
 * includes customer name, phone, email, address or internal ids.
 */

export type TrackedOrderItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type TrackedOrder = {
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  courier: string | null;
  trackingNumber: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: TrackedOrderItem[];
};

export type TrackingFieldErrors = {
  orderNumber?: string;
  phone?: string;
};

export function countPhoneDigits(value: string): number {
  return (value ?? "").replace(/[^0-9]/g, "").length;
}

export function validateTrackingInput(values: {
  orderNumber: string;
  phone: string;
}): TrackingFieldErrors {
  const errors: TrackingFieldErrors = {};

  const orderNumber = (values.orderNumber ?? "").trim();
  if (!orderNumber) {
    errors.orderNumber = "Please enter your order number.";
  } else if (orderNumber.length > 64) {
    errors.orderNumber = "That order number is not valid.";
  }

  const digits = countPhoneDigits(values.phone ?? "");
  if (digits === 0) {
    errors.phone = "Please enter the phone number used for the order.";
  } else if (digits < 8 || digits > 15) {
    errors.phone = "Please enter a valid phone number.";
  }

  return errors;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Defensively decode the jsonb returned by `get_order_tracking`. */
export function parseTrackedOrder(data: unknown): TrackedOrder | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;
  const orderNumber = toText(raw.order_number);
  if (!orderNumber) return null;

  const items: TrackedOrderItem[] = Array.isArray(raw.items)
    ? raw.items.map((entry) => {
        const record = (entry ?? {}) as Record<string, unknown>;
        return {
          name: toText(record.name),
          quantity: toNumber(record.quantity),
          unitPrice: toNumber(record.unit_price),
          subtotal: toNumber(record.subtotal),
        };
      })
    : [];

  return {
    orderNumber,
    createdAt: toText(raw.created_at),
    status: toText(raw.status) || "pending",
    paymentMethod: toText(raw.payment_method) || "pay_now",
    paymentStatus: toText(raw.payment_status) || "unpaid",
    courier: toText(raw.courier) || null,
    trackingNumber: toText(raw.tracking_number) || null,
    subtotal: toNumber(raw.subtotal),
    deliveryFee: toNumber(raw.delivery_fee),
    total: toNumber(raw.total),
    items,
  };
}
