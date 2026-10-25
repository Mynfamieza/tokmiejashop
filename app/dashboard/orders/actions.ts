"use server";

import { revalidatePath } from "next/cache";
import { getOwnerContext } from "@/lib/auth";
import { isOrderStatus } from "@/lib/order-status";
import { createClient } from "@/lib/supabase/server";

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
