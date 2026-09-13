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
