"use client";

import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/delivery";
import { cn } from "@/lib/utils";

export function PaymentMethodSelect({
  value,
  onChange,
  codAvailable,
  disabled,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  codAvailable: boolean;
  disabled?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-cocoa-800">
        Payment method
      </legend>

      <label
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3 transition",
          value === "pay_now"
            ? "border-brand-700 bg-brand-50"
            : "border-cocoa-900/15 bg-white hover:border-cocoa-900/25",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
      >
        <input
          type="radio"
          name="payment_method"
          value="pay_now"
          checked={value === "pay_now"}
          onChange={() => onChange("pay_now")}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 text-brand-700 focus:ring-brand-600/20"
        />
        <span>
          <span className="block text-sm font-medium text-cocoa-900">
            {PAYMENT_METHOD_LABELS.pay_now}
          </span>
          <span className="block text-xs text-cocoa-400">
            FPX / Online Banking or DuitNow QR via ToyyibPay. You&apos;ll be
            redirected to ToyyibPay to complete payment.
          </span>
        </span>
      </label>

      <label
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3 transition",
          !codAvailable
            ? "cursor-not-allowed border-cocoa-900/10 bg-cream-50 opacity-70"
            : value === "cod"
              ? "cursor-pointer border-brand-700 bg-brand-50"
              : "cursor-pointer border-cocoa-900/15 bg-white hover:border-cocoa-900/25",
        )}
      >
        <input
          type="radio"
          name="payment_method"
          value="cod"
          checked={value === "cod"}
          onChange={() => onChange("cod")}
          disabled={disabled || !codAvailable}
          className="mt-0.5 h-4 w-4 text-brand-700 focus:ring-brand-600/20"
        />
        <span>
          <span className="block text-sm font-medium text-cocoa-900">
            {PAYMENT_METHOD_LABELS.cod}
          </span>
          <span className="block text-xs text-cocoa-400">
            {codAvailable
              ? "Pay when your order is handed over."
              : "Available for Kulim addresses only."}
          </span>
        </span>
      </label>
    </fieldset>
  );
}
