"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteExpense } from "@/app/dashboard/finance/actions";
import { TrashIcon } from "@/components/icons";

export function ExpenseDeleteButton({
  id,
  description,
}: {
  id: string;
  description: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const confirmed = window.confirm(
      `Delete this expense (${description})? This cannot be undone.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteExpense(id);
      if (!result.ok) {
        setError(result.message ?? "Could not delete the expense.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={`Delete expense ${description}`}
        className="grid h-8 w-8 place-items-center rounded-full text-cocoa-500 transition hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
      {error ? <span className="text-xs text-brand-700">{error}</span> : null}
    </span>
  );
}
