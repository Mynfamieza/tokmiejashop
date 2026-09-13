"use client";

import { useState, type FormEvent } from "react";
import { OrderTrackingResult } from "@/components/track-order/order-tracking-result";
import { AlertIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import {
  validateTrackingInput,
  type TrackedOrder,
  type TrackingFieldErrors,
} from "@/lib/order-tracking";
import { trackOrder } from "./actions";

export function TrackOrderForm({
  defaultOrderNumber = "",
}: {
  defaultOrderNumber?: string;
}) {
  const [orderNumber, setOrderNumber] = useState(defaultOrderNumber);
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<TrackingFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const clientErrors = validateTrackingInput({ orderNumber, phone });
    setFieldErrors(clientErrors);
    setMessage(null);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await trackOrder({ orderNumber, phone });
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setMessage(result.message);
        return;
      }
      setOrder(result.order);
    } catch {
      setMessage("We could not check that order right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <div className="flex flex-col gap-5">
        <OrderTrackingResult order={order} />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOrder(null);
            setMessage(null);
          }}
        >
          Track another order
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="track-order-number">
          Order number <span className="text-brand-700">*</span>
        </Label>
        <Input
          id="track-order-number"
          name="orderNumber"
          autoComplete="off"
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.orderNumber)}
          aria-describedby={
            fieldErrors.orderNumber ? "track-order-number-error" : undefined
          }
          placeholder="cth. TM-20260101-001"
        />
        <FieldError id="track-order-number-error">
          {fieldErrors.orderNumber}
        </FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="track-order-phone">
          Phone number <span className="text-brand-700">*</span>
        </Label>
        <Input
          id="track-order-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={
            fieldErrors.phone ? "track-order-phone-error" : undefined
          }
          placeholder="cth. 012-3456789"
        />
        <FieldError id="track-order-phone-error">{fieldErrors.phone}</FieldError>
      </div>

      {message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Checking..." : "Track order"}
      </Button>

      <p className="text-xs text-cocoa-500">
        Use the order number and phone number from your order confirmation.
      </p>
    </form>
  );
}
