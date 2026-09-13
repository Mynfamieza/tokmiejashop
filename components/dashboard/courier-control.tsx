"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderCourier } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Owner-only editor for the optional courier + tracking number.
 * Empty values clear the fields. Only this data is saved.
 */
export function CourierControl({
  orderNumber,
  currentCourier,
  currentTrackingNumber,
}: {
  orderNumber: string;
  currentCourier: string | null;
  currentTrackingNumber: string | null;
}) {
  const router = useRouter();
  const [courier, setCourier] = useState(currentCourier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(
    currentTrackingNumber ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const dirty =
    courier !== (currentCourier ?? "") ||
    trackingNumber !== (currentTrackingNumber ?? "");

  async function handleSave() {
    if (submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await updateOrderCourier(
        orderNumber,
        courier,
        trackingNumber,
      );
      if (result.ok) {
        setFeedback({
          kind: "success",
          text: "Courier details saved.",
        });
        router.refresh();
      } else {
        setFeedback({ kind: "error", text: result.message });
      }
    } catch {
      setFeedback({
        kind: "error",
        text: "Could not save the courier details. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-cocoa-900">
        Courier &amp; tracking
      </h2>
      <p className="mt-1 text-xs text-cocoa-500">
        Optional. Shown to the customer on the order tracking page.
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="order-courier">Courier</Label>
          <Input
            id="order-courier"
            value={courier}
            onChange={(event) => {
              setCourier(event.target.value);
              setFeedback(null);
            }}
            disabled={submitting}
            maxLength={100}
            placeholder="cth. J&T, Pos Laju"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="order-tracking-number">Tracking number</Label>
          <Input
            id="order-tracking-number"
            value={trackingNumber}
            onChange={(event) => {
              setTrackingNumber(event.target.value);
              setFeedback(null);
            }}
            disabled={submitting}
            maxLength={100}
            placeholder="cth. LX123456789MY"
          />
        </div>
      </div>

      {feedback ? (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={cn(
            "mt-3 text-sm font-medium",
            feedback.kind === "error" ? "text-brand-700" : "text-emerald-700",
          )}
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="mt-4">
        <Button
          type="button"
          onClick={handleSave}
          disabled={submitting || !dirty}
        >
          {submitting ? "Saving..." : "Save courier details"}
        </Button>
      </div>
    </section>
  );
}
