/**
 * Configurable WhatsApp contact link (customer storefront).
 *
 * The number comes from NEXT_PUBLIC_WHATSAPP_NUMBER (public, not a secret).
 * Nothing is shown when it is not configured.
 */

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi TokMieja, I have a question about my order.";

/** Digits only; converts a local 0-prefixed MY number to international 60. */
export function normalizeWhatsAppNumber(value: string): string {
  const digits = (value ?? "").replace(/[^0-9]/g, "");
  if (digits.length === 0) return "";
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return `60${digits.slice(1)}`;
  return digits;
}

export function getWhatsAppNumber(): string {
  return normalizeWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  );
}

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppNumber().length >= 8;
}

export function getWhatsAppLink(
  message: string = WHATSAPP_DEFAULT_MESSAGE,
): string | null {
  const number = getWhatsAppNumber();
  if (number.length < 8) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
