"use server";

import { revalidatePath } from "next/cache";
import { getOwnerContext } from "@/lib/auth";
import { isOrderStatus } from "@/lib/order-status";
import { createClient } from "@/lib/supabase/server";
import { isPaymentStatus } from "@/lib/delivery";

/** Payment state changes only after an explicit save by an authenticated owner. */
export async function updateOrderPaymentStatus(
  orderNumber: string,
  paymentStatus: string,
): Promise<UpdateOrderStatusResult> {
  const { configured, user, isOwner } = await getOwnerContext();
  if (!configured || !user || !isOwner) {
    return { ok: false, message: "Please sign in with an owner account to verify payments." };
  }
  if (
    typeof orderNumber !== "string" ||
    orderNumber.length === 0 ||
    orderNumber.length > 64 ||
    !isPaymentStatus(paymentStatus)
  ) {
    return { ok: false, message: "Please choose a valid order and payment status." };
  }

  try {
    const supabase = await createClient();
    const { data: current, error: readError } = await supabase
      .from("orders")
      .select("payment_paid_at, updated_at")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (readError || !current) {
      return { ok: false, message: "This order could not be loaded. Please refresh and try again." };
    }

    const { data, error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        // Keep any original payment timestamp and all historical gateway fields.
        payment_paid_at: paymentStatus === "paid" && !current.payment_paid_at
          ? new Date().toISOString()
          : current.payment_paid_at,
      })
      .eq("order_number", orderNumber)
      .eq("updated_at", current.updated_at)
      .select("order_number")
      .maybeSingle();

    if (error) return { ok: false, message: "Could not save the payment status. Please try again." };
    if (!data) return { ok: false, message: "The order changed. Please refresh before saving again." };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderNumber}`);
    revalidatePath("/dashboard/finance");
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not save the payment status. Please try again." };
  }
}

export type UpdateOrderStatusResult =
  | { ok: true }
  | { ok: false; message: string };

const GENERIC_ERROR = "Could not update the status. Please try again.";

export async function updateOrderStatus(
  orderNumber: string,
  status: string,
): Promise<UpdateOrderStatusResult> {
  // Verify authentication AND owner authorization inside the action itself.
  // Server actions are reachable by direct POST, so RLS/UI alone is not enough.
  const { configured, user, isOwner } = await getOwnerContext();

  if (!configured) {
    return {
      ok: false,
      message: "Order management is not available right now.",
    };
  }
  if (!user) {
    return { ok: false, message: "Please sign in again." };
  }
  if (!isOwner) {
    return {
      ok: false,
      message: "You do not have permission to update orders.",
    };
  }

  if (
    typeof orderNumber !== "string" ||
    orderNumber.length === 0 ||
    orderNumber.length > 64
  ) {
    return { ok: false, message: "This order could not be found." };
  }

  if (!isOrderStatus(status)) {
    return { ok: false, message: "That status is not valid." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_number", orderNumber)
      .select("order_number")
      .maybeSingle();

    if (error) return { ok: false, message: GENERIC_ERROR };
    if (!data) return { ok: false, message: "This order could not be found." };

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderNumber}`);

    return { ok: true };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }
}

export type UpdateCourierResult =
  | { ok: true }
  | { ok: false; message: string };

const COURIER_ERROR = "Could not save the courier details. Please try again.";
const MAX_COURIER_LENGTH = 100;

/**
 * Owner-only: set or clear the optional courier + tracking number on an
 * existing order. Empty values clear the fields. Status, payment, delivery
 * and totals are never touched.
 */
export async function updateOrderCourier(
  orderNumber: string,
  courier: string,
  trackingNumber: string,
): Promise<UpdateCourierResult> {
  // Verify authentication AND owner authorization inside the action itself.
  const { configured, user, isOwner } = await getOwnerContext();

  if (!configured) {
    return {
      ok: false,
      message: "Order management is not available right now.",
    };
  }
  if (!user) {
    return { ok: false, message: "Please sign in again." };
  }
  if (!isOwner) {
    return {
      ok: false,
      message: "You do not have permission to update orders.",
    };
  }

  if (
    typeof orderNumber !== "string" ||
    orderNumber.length === 0 ||
    orderNumber.length > 64
  ) {
    return { ok: false, message: "This order could not be found." };
  }

  const nextCourier = typeof courier === "string" ? courier.trim() : "";
  const nextTracking =
    typeof trackingNumber === "string" ? trackingNumber.trim() : "";

  if (nextCourier.length > MAX_COURIER_LENGTH) {
    return { ok: false, message: "Courier name is too long (max 100)." };
  }
  if (nextTracking.length > MAX_COURIER_LENGTH) {
    return {
      ok: false,
      message: "Tracking number is too long (max 100).",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({
        courier: nextCourier || null,
        tracking_number: nextTracking || null,
      })
      .eq("order_number", orderNumber)
      .select("order_number")
      .maybeSingle();

    if (error) return { ok: false, message: COURIER_ERROR };
    if (!data) return { ok: false, message: "This order could not be found." };

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderNumber}`);

    return { ok: true };
  } catch {
    return { ok: false, message: COURIER_ERROR };
  }
}
