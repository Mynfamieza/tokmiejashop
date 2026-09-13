import { cn } from "@/lib/utils";

/**
 * Branded placeholder shown when a product has no image yet.
 * It reuses the existing TokMieja monogram so it reads as intentional, and it
 * is clearly not a product photograph.
 */
export function ProductImagePlaceholder({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2.5 bg-cream-100 text-cocoa-400",
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 font-display text-base font-extrabold text-cream-50 shadow-button">
        TM
      </span>
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
        Photo coming soon
      </span>
    </div>
  );
}
