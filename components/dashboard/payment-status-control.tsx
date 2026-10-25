"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderPaymentStatus } from "@/app/dashboard/orders/actions";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_LABELS } from "@/lib/delivery";

export function PaymentStatusControl({
  orderNumber,
  currentStatus,
}: {
  orderNumber: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await updateOrderPaymentStatus(orderNumber, selected);
        if (!result.ok) {
          setFeedback(result.message);
          return;
        }
        router.refresh();
      } catch {
        setFeedback("Could not save the payment status. Please try again.");
      }
    });
  }

  return (
    <div className="mt-5 border-t border-cocoa-900/10 pt-4">
      <p className="text-sm leading-relaxed text-cocoa-700" lang="ms">
        Semak transaksi dalam akaun bank atau e-dompet penerima. Pastikan jumlah
        dan rujukan pesanan sepadan sebelum menandakan bayaran sebagai Paid.
        Pengesahan ini dilakukan secara manual oleh pemilik.
      </p>
      <label htmlFor="payment-status" className="mt-4 block text-sm font-medium text-cocoa-800">
        Payment status
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <select
          id="payment-status"
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            setFeedback(null);
          }}
          disabled={pending}
          className="h-11 rounded-xl border border-cocoa-900/15 bg-white px-3 text-sm text-cocoa-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10 disabled:opacity-60"
        >
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <Button type="button" onClick={handleSave} disabled={pending || selected === currentStatus}>
          {pending ? "Saving..." : "Save payment status"}
        </Button>
      </div>
      {feedback ? <p role="alert" className="mt-3 text-sm text-brand-700">{feedback}</p> : null}
    </div>
  );
}
