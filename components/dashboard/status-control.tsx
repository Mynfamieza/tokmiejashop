"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function StatusControl({
  orderNumber,
  currentStatus,
}: {
  orderNumber: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const dirty = selected !== currentStatus;

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderNumber, selected);
      if (result.ok) {
        setFeedback({ kind: "success", text: "Status updated." });
        router.refresh();
      } else {
        setFeedback({ kind: "error", text: result.message });
      }
    });
  }

  return (
    <section className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-cocoa-900">
        Update status
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="order-status" className="sr-only">
          Order status
        </label>
        <select
          id="order-status"
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            setFeedback(null);
          }}
          disabled={pending}
          className="h-11 rounded-xl border border-cocoa-900/15 bg-white px-3 text-sm text-cocoa-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10 disabled:opacity-60"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <Button
          type="button"
          onClick={handleSave}
          disabled={pending || !dirty}
        >
          {pending ? "Saving..." : "Save status"}
        </Button>
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

      <p className="mt-3 text-xs leading-relaxed text-cocoa-400">
        Normal flow: Pending → Confirmed → Preparing → Shipped → Completed.
        Cancelling is also available.
      </p>
    </section>
  );
}
