import { createHash, timingSafeEqual } from "node:crypto";

/**
 * ToyyibPay integration (server-only).
 *
 * Reference: https://toyyibpay.com/apireference/
 *   - Create Bill:      POST {base}/index.php/api/createBill
 *   - Get Transactions: POST {base}/index.php/api/getBillTransactions
 *   - Callback hash:    MD5(userSecretKey + status + order_id + refno + "ok")
 *
 * The secret key is read from server environment variables and must never be
 * exposed to the browser.
 */

export const TOYYIBPAY_PAYMENT_CHANNEL_FPX = "0";

export type ToyyibpayConfig = {
  configured: boolean;
  apiUrl: string;
  secretKey: string;
  categoryCode: string;
  enableDuitnowQr: boolean;
  sandbox: boolean;
};

export function getToyyibpayConfig(): ToyyibpayConfig {
  const apiUrl = (process.env.TOYYIBPAY_API_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
  const secretKey = (process.env.TOYYIBPAY_SECRET_KEY ?? "").trim();
  const categoryCode = (process.env.TOYYIBPAY_CATEGORY_CODE ?? "").trim();
  const enableDuitnowQr =
    (process.env.TOYYIBPAY_ENABLE_DUITNOW_QR ?? "1") !== "0";

  return {
    apiUrl,
    secretKey,
    categoryCode,
    enableDuitnowQr,
    sandbox: apiUrl.includes("dev.toyyibpay.com"),
    configured: Boolean(apiUrl && secretKey && categoryCode),
  };
}

export function isToyyibpayConfigured(): boolean {
  return getToyyibpayConfig().configured;
}

/** ToyyibPay billAmount is in cents: 100 = RM1.00. */
export function toCents(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

/** billName / billDescription allow alphanumeric, space and underscore only. */
export function sanitizeBillText(value: string, maxLength: number): string {
  return (value ?? "")
    .replace(/[^A-Za-z0-9 _]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * MD5(userSecretKey + status + order_id + refno + "ok") - the official
 * ToyyibPay callback hash.
 */
export function computeToyyibpayHash(params: {
  secretKey: string;
  status: string;
  orderId: string;
  refno: string;
}): string {
  return createHash("md5")
    .update(
      `${params.secretKey}${params.status}${params.orderId}${params.refno}ok`,
    )
    .digest("hex");
}

export function verifyToyyibpayHash(
  params: { secretKey: string; status: string; orderId: string; refno: string },
  providedHash: string,
): boolean {
  const expected = computeToyyibpayHash(params);
  const provided = (providedHash ?? "").trim().toLowerCase();
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

export function mapToyyibpayStatus(status: string): "paid" | "pending" | "failed" {
  const value = (status ?? "").trim();
  if (value === "1") return "paid";
  if (value === "3") return "failed";
  return "pending";
}

const GENERIC_ERROR =
  "Sorry, we could not start the payment. Please try again.";

async function postForm(
  url: string,
  body: URLSearchParams,
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export type CreateToyyibpayBillInput = {
  amount: number;
  referenceNo: string;
  returnUrl: string;
  callbackUrl: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
};

export type ToyyibpayCreateResult =
  | { ok: true; billCode: string }
  | { ok: false; message: string };

export async function createToyyibpayBill(
  input: CreateToyyibpayBillInput,
): Promise<ToyyibpayCreateResult> {
  const { configured, apiUrl, secretKey, categoryCode, enableDuitnowQr } =
    getToyyibpayConfig();
  if (!configured) return { ok: false, message: GENERIC_ERROR };

  const body = new URLSearchParams();
  body.set("userSecretKey", secretKey);
  body.set("categoryCode", categoryCode);
  body.set("billName", sanitizeBillText(`TokMieja ${input.referenceNo}`, 30));
  body.set(
    "billDescription",
    sanitizeBillText(input.description ?? `Order ${input.referenceNo}`, 100),
  );
  body.set("billPriceSetting", "1");
  body.set("billPayorInfo", "1");
  body.set("billAmount", String(toCents(input.amount)));
  body.set("billReturnUrl", input.returnUrl);
  body.set("billCallbackUrl", input.callbackUrl);
  body.set("billExternalReferenceNo", input.referenceNo);
  body.set("billTo", input.name);
  body.set("billEmail", input.email);
  body.set("billPhone", input.phone);
  body.set("billPaymentChannel", TOYYIBPAY_PAYMENT_CHANNEL_FPX);
  if (enableDuitnowQr) {
    body.set("enableDuitNowQR", "1");
    body.set("chargeDuitNowQR", "0");
  }

  try {
    const response = await postForm(`${apiUrl}/index.php/api/createBill`, body);
    const text = await response.text();

    let billCode: string | null = null;
    let friendMessage: string | null = null;

    try {
      const data = JSON.parse(text) as unknown;
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0] as Record<string, unknown>;
        if (typeof first.BillCode === "string" && first.BillCode.length > 0) {
          billCode = first.BillCode;
        }
      } else if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        if (typeof record.msg === "string") friendMessage = record.msg;
      }
    } catch {
      // Plain-text error code, e.g. "[KEY-DID-NOT-EXIST]".
      const plain = text.trim();
      if (plain) friendMessage = plain;
    }

    if (!billCode) {
      // Log a short, non-secret diagnostic only.
      console.error(
        `[toyyibpay] createBill failed: ${(friendMessage ?? "unknown").slice(0, 120)}`,
      );
      return { ok: false, message: GENERIC_ERROR };
    }

    return { ok: true, billCode };
  } catch {
    console.error("[toyyibpay] createBill network/parse error");
    return { ok: false, message: GENERIC_ERROR };
  }
}

export type ToyyibpayBillStatus = {
  ok: true;
  status: string;
  amount: string | null;
  referenceNo: string | null;
};

/**
 * Server-side status lookup used by the return page.
 * billpaymentStatus: 1 = success, 2/4 = pending, 3 = unsuccessful.
 */
export async function getToyyibpayBillStatus(
  billCode: string,
): Promise<ToyyibpayBillStatus | { ok: false }> {
  const { configured, apiUrl } = getToyyibpayConfig();
  if (!configured || !billCode) return { ok: false };

  try {
    const body = new URLSearchParams();
    body.set("billCode", billCode);

    const response = await postForm(
      `${apiUrl}/index.php/api/getBillTransactions`,
      body,
    );
    if (!response.ok) return { ok: false };

    const data = (await response.json()) as unknown;
    if (!Array.isArray(data) || data.length === 0) {
      return { ok: true, status: "", amount: null, referenceNo: null };
    }

    const transactions = data as Array<Record<string, unknown>>;
    const pick = (statusCode: string) =>
      transactions.find(
        (entry) => String(entry.billpaymentStatus ?? "") === statusCode,
      );

    const success = pick("1");
    const failed = pick("3");
    const chosen = success ?? failed ?? transactions[0];

    return {
      ok: true,
      status: String(chosen.billpaymentStatus ?? ""),
      amount:
        typeof chosen.billpaymentAmount === "string"
          ? chosen.billpaymentAmount
          : null,
      referenceNo:
        typeof chosen.billExternalReferenceNo === "string"
          ? chosen.billExternalReferenceNo
          : null,
    };
  } catch {
    return { ok: false };
  }
}
