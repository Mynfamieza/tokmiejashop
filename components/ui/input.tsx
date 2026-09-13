import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export const inputClassName =
  "h-12 w-full rounded-xl border border-cocoa-900/15 bg-white px-4 text-base text-cocoa-900 placeholder:text-cocoa-400 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10 disabled:opacity-60";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputClassName, "h-auto min-h-28 py-3", className)}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-semibold text-cocoa-800", className)}
      {...props}
    />
  );
}

export function FieldError({
  id,
  children,
}: {
  id?: string;
  children?: string | null;
}) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="text-sm font-medium text-brand-700">
      {children}
    </p>
  );
}
