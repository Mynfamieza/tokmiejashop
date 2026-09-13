import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Temporary text-based brand treatment.
 * Swap the monogram tile for the official TokMieja logo asset when available.
 */
export function BrandMark({
  inverted = false,
  className,
}: {
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="TokMieja Shop - halaman utama"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-700 font-display text-lg font-extrabold text-cream-50 shadow-button transition duration-300 group-hover:-rotate-3">
        TM
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-lg font-extrabold",
            inverted ? "text-cream-50" : "text-cocoa-900",
          )}
        >
          TokMieja
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[0.6rem] font-bold uppercase tracking-[0.28em]",
            inverted ? "text-mango-300" : "text-brand-700",
          )}
        >
          Shop
        </span>
      </span>
    </Link>
  );
}
