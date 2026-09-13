import type { ReactNode } from "react";

export function DashboardMessage({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-cocoa-900/10 bg-white px-6 py-14 text-center">
      <h2 className="font-display text-lg font-semibold text-cocoa-900">
        {title}
      </h2>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-cocoa-500">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
