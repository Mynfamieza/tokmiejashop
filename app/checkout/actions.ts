"use server";

import { headers } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  isKulimAddress,
  isPaymentMethod,
  isValidLocationPin,
} from "@/lib/delivery";
import {
  createToyyibpayBill,
  getToyyibpayConfig,
  isToyyibpayConfigured,
} from "@/lib/toyyibpay";
import {
  hasErrors,
  mapOrderError,
  validateCustomer,
  type CustomerFormValues,
  type OrderConfirmation,
  type OrderSummaryItem,
} from "@/lib/checkout";

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customer: CustomerFormValues;
  items: CreateOrderItemInput[];
  idempotencyKey: string;
  paymentMethod: string;
  locationPin?: string;
};

export type CreateOrderResult =
  | { ok: true; order: OrderConfirmation; paymentUrl?: string }
  | { ok: false; code: string; message: string };

const FALLBACK_ERROR =
  "Sorry, we could not place your order. Please try again.";

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const customer = sanitizeCustomer(input?.customer);

  if (hasErrors(validateCustomer(customer))) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Please check your details and try again.",
    };
  }

  const items = Array.isArray(input?.items) ? input.items : [];

  if (items.length === 0) {
    return { ok: false, code: "EMPTY_CART", message: "Your cart is empty." };
  }

  if (items.length > 50) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "There are too many items in this order.",
    };
  }

  for (const item of items) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      item.productId.length === 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      return {
        ok: false,
        code: "INVALID_QUANTITY",
        message: "One of the item quantities is not valid.",
      };
    }
  }

  const idempotencyKey =
    typeof input?.idempotencyKey === "string"
      ? input.idempotencyKey.trim()
      : "";

  if (idempotencyKey.length < 8 || idempotencyKey.length > 100) {
    return { ok: false, code: "INVALID_INPUT", message: FALLBACK_ERROR };
  }

  // Payment method + location pin are validated server-side (never trusted).
  if (!isPaymentMethod(input?.paymentMethod)) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Please choose a payment method.",
    };
  }
  const paymentMethod = input.paymentMethod;

  const locationPin =
    typeof input?.locationPin === "string" ? input.locationPin.trim() : "";
  if (!isValidLocationPin(locationPin)) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Please enter a valid map link (https://...).",
    };
  }

  if (paymentMethod === "cod" && !isKulimAddress(customer.address)) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "COD / Pay by Hand is only available for Kulim addresses.",
    };
  }

  // ToyyibPay requires a payer email on the bill.
  if (paymentMethod === "pay_now" && customer.email.length === 0) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Please provide an email address for online payment.",
    };
  }

  if (!isSupabaseConfigured) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Ordering is not available right now. Please try again later.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: customer.name,
      p_customer_phone: customer.phone,
      p_customer_email: customer.email || null,
      p_delivery_address: customer.address,
      p_notes: customer.notes || null,
      p_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      p_idempotency_key: idempotencyKey,
      p_payment_method: paymentMethod,
      p_location_pin: locationPin || null,
    });

    if (error) {
      const mapped = mapOrderError(error.message ?? "");
      return { ok: false, code: mapped.code, message: mapped.message };
    }

    const order = parseOrderConfirmation(data);
    if (!order) {
      return { ok: false, code: "SERVER_ERROR", message: FALLBACK_ERROR };
    }

    // Pay Now -> create a ToyyibPay bill (FPX / DuitNow QR) using the
    // server-calculated order total. The browser only receives the bill URL.
    if (order.paymentMethod === "pay_now") {
      if (!isToyyibpayConfigured()) {
        return {
          ok: false,
          code: "PAYMENT_UNAVAILABLE",
          message:
            "Online payment is not available right now. Please try again later.",
        };
      }

      const baseUrl = await resolveBaseUrl();
      const bill = await createToyyibpayBill({
        amount: order.total,
        referenceNo: order.orderNumber,
        returnUrl: `${baseUrl}/payment/toyyibpay/return`,
        callbackUrl: `${baseUrl}/api/webhooks/toyyibpay`,
        name: customer.name,
        email: customer.email,
        phone: digitsOnly(customer.phone),
        description: `Order ${order.orderNumber}`,
      });

      if (!bill.ok) {
        return {
          ok: false,
          code: "PAYMENT_INIT_FAILED",
          message: bill.message,
        };
      }

      const paymentUrl = `${getToyyibpayConfig().apiUrl}/${bill.billCode}`;
      return { ok: true, order, paymentUrl };
    }

    return { ok: true, order };
  } catch {
    return { ok: false, code: "SERVER_ERROR", message: FALLBACK_ERROR };
  }
}

async function resolveBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

function digitsOnly(value: string): string {
  return (value ?? "").replace(/[^0-9]/g, "");
}

function sanitizeCustomer(values: CustomerFormValues): CustomerFormValues {
  return {
    name: (values?.name ?? "").trim(),
    phone: (values?.phone ?? "").trim(),
    email: (values?.email ?? "").trim(),
    address: (values?.address ?? "").trim(),
    notes: (values?.notes ?? "").trim(),
    locationPin: (values?.locationPin ?? "").trim(),
  };
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseOrderConfirmation(data: unknown): OrderConfirmation | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;
  if (typeof raw.order_number !== "string" || raw.order_number.length === 0) {
    return null;
  }

  const items: OrderSummaryItem[] = Array.isArray(raw.items)
    ? raw.items.map((entry) => {
        const record = (entry ?? {}) as Record<string, unknown>;
        return {
          name: String(record.name ?? ""),
          quantity: toNumber(record.quantity),
          unitPrice: toNumber(record.unit_price),
          subtotal: toNumber(record.subtotal),
        };
      })
    : [];

  return {
    orderNumber: raw.order_number,
    customerName:
      typeof raw.customer_name === "string" ? raw.customer_name : "",
    status: typeof raw.status === "string" ? raw.status : "pending",
    deliveryAddress:
      typeof raw.delivery_address === "string" ? raw.delivery_address : "",
    locationPin:
      typeof raw.location_pin === "string" && raw.location_pin.length > 0
        ? raw.location_pin
        : null,
    paymentMethod:
      typeof raw.payment_method === "string" ? raw.payment_method : "pay_now",
    paymentStatus:
      typeof raw.payment_status === "string" ? raw.payment_status : "unpaid",
    subtotal: toNumber(raw.subtotal),
    deliveryFee: toNumber(raw.delivery_fee),
    total: toNumber(raw.total),
    createdAt: typeof raw.created_at === "string" ? raw.created_at : "",
    items,
  };
}
