import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-panel border border-cocoa-900/10 bg-white p-4 sm:p-5",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-cocoa-400">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold text-cocoa-900">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-cocoa-400">{hint}</p> : null}
    </div>
  );
}
