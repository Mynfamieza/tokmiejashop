import type { CartItem } from "@/lib/cart";
import { isValidLocationPin } from "@/lib/delivery";

export const ORDER_SESSION_PREFIX = "tokmieja.order.";

export type CustomerFormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  locationPin: string;
};

export type CustomerFormErrors = Partial<
  Record<keyof CustomerFormValues, string>
>;

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  locationPin: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCustomer(
  values: CustomerFormValues,
): CustomerFormErrors {
  const errors: CustomerFormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }

  const phoneDigits = values.phone.replace(/[^0-9]/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    errors.phone = "Please enter a valid phone number.";
  }

  const email = values.email.trim();
  if (email.length > 0 && !EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.address.trim().length < 5) {
    errors.address = "Please enter your delivery address.";
  }

  if (!isValidLocationPin(values.locationPin)) {
    errors.locationPin = "Please enter a valid map link (https://...).";
  }

  if (values.notes.trim().length > 500) {
    errors.notes = "Notes must be 500 characters or fewer.";
  }

  return errors;
}

export function hasErrors(errors: CustomerFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type OrderSummaryItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export function cartItemsToSummaryItems(
  items: CartItem[],
): OrderSummaryItem[] {
  return items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    subtotal: item.price * item.quantity,
  }));
}

export type OrderConfirmation = {
  orderNumber: string;
  customerName: string;
  status: string;
  deliveryAddress: string;
  locationPin: string | null;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderSummaryItem[];
  createdAt: string;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Persist the confirmation for the current browser session (survives refresh). */
export function saveOrderConfirmation(order: OrderConfirmation): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      ORDER_SESSION_PREFIX + order.orderNumber,
      JSON.stringify(order),
    );
  } catch {
    // Session storage unavailable; the confirmation page will still render.
  }
}

export function loadOrderConfirmation(
  orderNumber: string,
): OrderConfirmation | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(
      ORDER_SESSION_PREFIX + orderNumber,
    );
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<OrderConfirmation>;
    if (
      !parsed ||
      typeof parsed.orderNumber !== "string" ||
      !Array.isArray(parsed.items)
    ) {
      return null;
    }

    return {
      orderNumber: parsed.orderNumber,
      customerName:
        typeof parsed.customerName === "string" ? parsed.customerName : "",
      status: typeof parsed.status === "string" ? parsed.status : "pending",
      deliveryAddress:
        typeof parsed.deliveryAddress === "string"
          ? parsed.deliveryAddress
          : "",
      locationPin:
        typeof parsed.locationPin === "string" && parsed.locationPin.length > 0
          ? parsed.locationPin
          : null,
      paymentMethod:
        typeof parsed.paymentMethod === "string" && parsed.paymentMethod
          ? parsed.paymentMethod
          : "pay_now",
      paymentStatus:
        typeof parsed.paymentStatus === "string" && parsed.paymentStatus
          ? parsed.paymentStatus
          : "unpaid",
      subtotal: toNumber(parsed.subtotal),
      deliveryFee: toNumber(parsed.deliveryFee),
      total: toNumber(parsed.total),
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : "",
      items: parsed.items.map((item) => ({
        name: String(item?.name ?? ""),
        quantity: toNumber(item?.quantity),
        unitPrice: toNumber(item?.unitPrice),
        subtotal: toNumber(item?.subtotal),
      })),
    };
  } catch {
    return null;
  }
}

export type OrderErrorCode =
  | "EMPTY_CART"
  | "INVALID_INPUT"
  | "INVALID_QUANTITY"
  | "PRODUCT_UNAVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "NOT_CONFIGURED"
  | "SERVER_ERROR";

const ORDER_ERROR_MAP: Record<
  string,
  { code: OrderErrorCode; message: string }
> = {
  NAMA_REQUIRED: {
    code: "INVALID_INPUT",
    message: "Please enter the customer's full name.",
  },
  TELEFON_REQUIRED: {
    code: "INVALID_INPUT",
    message: "Please enter a valid phone number.",
  },
  ALAMAT_REQUIRED: {
    code: "INVALID_INPUT",
    message: "Please enter a delivery address.",
  },
  TIADA_ITEM: {
    code: "EMPTY_CART",
    message: "Your cart is empty.",
  },
  TERLALU_BANYAK_ITEM: {
    code: "INVALID_INPUT",
    message: "There are too many items in this order.",
  },
  KUANTITI_TIDAK_SAH: {
    code: "INVALID_QUANTITY",
    message: "One of the item quantities is not valid.",
  },
  PRODUK_TIDAK_DITEMUI: {
    code: "PRODUCT_UNAVAILABLE",
    message: "One of the products is no longer available.",
  },
  PRODUK_TIDAK_AKTIF: {
    code: "PRODUCT_UNAVAILABLE",
    message: "One of the products is no longer available.",
  },
  STOK_TIDAK_CUKUP: {
    code: "INSUFFICIENT_STOCK",
    message: "There is not enough stock for one of the products.",
  },
  KAEDAH_BAYARAN_TIDAK_SAH: {
    code: "INVALID_INPUT",
    message: "Please choose a valid payment method.",
  },
  PIN_TIDAK_SAH: {
    code: "INVALID_INPUT",
    message: "Please enter a valid map link (https://...).",
  },
  COD_TIDAK_LAYAK: {
    code: "INVALID_INPUT",
    message: "COD / Pay by Hand is only available for Kulim addresses.",
  },
};

/** Convert a raw database error into a safe, friendly message. */
export function mapOrderError(rawMessage: string): {
  code: OrderErrorCode;
  message: string;
} {
  for (const key of Object.keys(ORDER_ERROR_MAP)) {
    if (rawMessage.includes(key)) return ORDER_ERROR_MAP[key];
  }

  return {
    code: "SERVER_ERROR",
    message: "Sorry, we could not place your order. Please try again.",
  };
}
