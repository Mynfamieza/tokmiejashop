import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "outline"
  | "soft"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,color,box-shadow,border-color] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-700 text-cream-50 shadow-button hover:bg-brand-800",
  accent:
    "bg-mango-400 text-cocoa-950 shadow-[0_10px_20px_-10px_rgba(224,146,15,0.7)] hover:bg-mango-500",
  outline:
    "border border-cocoa-900/15 bg-white/80 text-cocoa-900 hover:border-brand-700/40 hover:bg-white",
  soft: "bg-brand-50 text-brand-800 hover:bg-brand-100",
  ghost: "text-cocoa-800 hover:bg-cocoa-900/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm sm:text-base",
  lg: "h-14 px-7 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
