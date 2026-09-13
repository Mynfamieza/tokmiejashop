import { SparkleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function PreviewNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-mango-300/70 bg-mango-50 px-4 py-3 text-sm text-cocoa-700",
        className,
      )}
      role="status"
    >
      <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-mango-500" />
      <p>
        <strong className="font-bold text-cocoa-900">Preview mode:</strong>{" "}
        Supabase is not configured, so a sample catalogue is being shown.
        Connect Supabase and run <code>schema.sql</code> and{" "}
        <code>seed.sql</code> to see real data.
      </p>
    </div>
  );
}
