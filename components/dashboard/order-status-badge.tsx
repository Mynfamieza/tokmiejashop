import {
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  isOrderStatus,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const known = isOrderStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        known
          ? ORDER_STATUS_BADGE_CLASSES[status]
          : "bg-cocoa-100 text-cocoa-600",
        className,
      )}
    >
      {known ? ORDER_STATUS_LABELS[status] : status}
    </span>
  );
}
