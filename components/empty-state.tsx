import type { ReactNode } from "react";
import { BowlIcon } from "@/components/icons";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-cocoa-900/15 bg-white/60 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <BowlIcon className="h-7 w-7" />
      </span>
      <h3 className="font-display text-lg font-bold text-cocoa-900">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-cocoa-600">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
