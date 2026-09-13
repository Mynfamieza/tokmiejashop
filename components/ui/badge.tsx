import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "brand" | "accent" | "success";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-cream-100 text-cocoa-700 ring-1 ring-inset ring-cocoa-900/10",
  brand: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-700/15",
  accent: "bg-mango-400 text-cocoa-950",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
