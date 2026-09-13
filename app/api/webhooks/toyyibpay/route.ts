import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getToyyibpayConfig, verifyToyyibpayHash } from "@/lib/toyyibpay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ToyyibPay server-to-server callback.
 *
 * The callback hash (MD5(userSecretKey + status + order_id + refno + "ok")) is
 * checked here with the server key and again inside the database function
 * `process_toyyibpay_callback` (which is what actually updates the order).
 * ToyyibPay sends form-urlencoded POST data.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const refno = String(form.get("refno") ?? "");
  const status = String(form.get("status") ?? "");
  const orderId = String(form.get("order_id") ?? "");
  const amount = String(form.get("amount") ?? "");
  const billcode = String(form.get("billcode") ?? "");
  const transactionTime = String(form.get("transaction_time") ?? "");
  const transactionId = String(form.get("transaction_id") ?? "");
  const hash = String(form.get("hash") ?? "");

  if (!refno || !status || !orderId || !hash) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  // Fast, local verification (defense in depth; the database re-verifies).
  const { secretKey } = getToyyibpayConfig();
  if (secretKey) {
    const valid = verifyToyyibpayHash(
      { secretKey, status, orderId, refno },
      hash,
    );
    if (!valid) {
      return NextResponse.json({ ok: false, error: "invalid_hash" }, { status: 401 });
    }
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("process_toyyibpay_callback", {
      p_refno: refno,
      p_status: status,
      p_order_id: orderId,
      p_amount: amount,
      p_billcode: billcode,
      p_transaction_time: transactionTime,
      p_hash: hash,
      p_transaction_id: transactionId || null,
    });

    if (error) {
      const message = error.message ?? "";
      if (message.includes("HASH_TIDAK_SAH")) {
        return NextResponse.json({ ok: false, error: "invalid_hash" }, { status: 401 });
      }
      if (message.includes("KUNCI_TIDAK_DISET")) {
        console.error("[toyyibpay-webhook] secret key not configured in app_settings");
        return NextResponse.json({ ok: false }, { status: 500 });
      }
      if (message.includes("RUJUKAN_TIADA")) {
        return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
      }
      console.error(`[toyyibpay-webhook] processing error: ${message.slice(0, 160)}`);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, result: data ?? null });
  } catch {
    console.error("[toyyibpay-webhook] unexpected error");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
