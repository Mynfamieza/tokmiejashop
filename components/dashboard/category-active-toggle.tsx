"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setCategoryActive } from "@/app/dashboard/categories/actions";
import { cn } from "@/lib/utils";

export function CategoryActiveToggle({
  id,
  active,
  name,
}: {
  id: string;
  active: boolean;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (active) {
      const confirmed = window.confirm(
        `Deactivate "${name}"? Its products will be hidden from the storefront.`,
      );
      if (!confirmed) return;
    }

    setError(null);
    startTransition(async () => {
      const result = await setCategoryActive(id, !active);
      if (!result.ok) {
        setError(result.message);
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
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60",
          active
            ? "border-brand-700/30 text-brand-700 hover:bg-brand-50"
            : "border-emerald-600/30 text-emerald-700 hover:bg-emerald-50",
        )}
      >
        {pending ? "Saving…" : active ? "Deactivate" : "Activate"}
      </button>
      {error ? <span className="text-xs text-brand-700">{error}</span> : null}
    </span>
  );
}
