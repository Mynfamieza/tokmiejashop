"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  parseTrackedOrder,
  validateTrackingInput,
  type TrackedOrder,
  type TrackingFieldErrors,
} from "@/lib/order-tracking";

export type TrackOrderResult =
  | { ok: true; order: TrackedOrder }
  | {
      ok: false;
      code: "INVALID" | "NOT_FOUND" | "SERVER";
      message: string;
      fieldErrors?: TrackingFieldErrors;
    };

const SERVER_ERROR =
  "We could not check that order right now. Please try again.";
const NOT_FOUND_ERROR =
  "We could not find an order with that order number and phone number.";

export async function trackOrder(input: {
  orderNumber: string;
  phone: string;
}): Promise<TrackOrderResult> {
  const orderNumber = (input?.orderNumber ?? "").trim();
  const phone = (input?.phone ?? "").trim();

  const fieldErrors = validateTrackingInput({ orderNumber, phone });
  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      code: "INVALID",
      message: "Please check the details and try again.",
      fieldErrors,
    };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, code: "SERVER", message: SERVER_ERROR };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_order_tracking", {
      p_order_number: orderNumber,
      p_phone: phone,
    });

    // Never surface raw database errors to the customer.
    if (error) return { ok: false, code: "SERVER", message: SERVER_ERROR };

    const order = parseTrackedOrder(data);
    if (!order) {
      return { ok: false, code: "NOT_FOUND", message: NOT_FOUND_ERROR };
    }

    return { ok: true, order };
  } catch {
    return { ok: false, code: "SERVER", message: SERVER_ERROR };
  }
}
