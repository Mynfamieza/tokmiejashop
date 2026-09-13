import { WhatsAppIcon } from "@/components/icons";
import {
  WHATSAPP_DEFAULT_MESSAGE,
  getWhatsAppLink,
} from "@/lib/whatsapp";

/** Subtle footer link (all viewports). Hidden when not configured. */
export function WhatsAppFooterLink() {
  const href = getWhatsAppLink(WHATSAPP_DEFAULT_MESSAGE);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-cocoa-600 transition-colors hover:text-brand-700"
    >
      <WhatsAppIcon className="h-4 w-4" />
      Chat with us on WhatsApp
    </a>
  );
}

/** Small mobile-only floating button. Hidden when not configured. */
export function WhatsAppFloatingButton() {
  const href = getWhatsAppLink(WHATSAPP_DEFAULT_MESSAGE);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 sm:hidden"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
