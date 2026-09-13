import type { OrderSummaryItem } from "@/lib/checkout";
import { cn, formatPrice } from "@/lib/utils";

export function OrderSummary({
  items,
  subtotal,
  deliveryFee,
  total,
  title = "Order summary",
  className,
}: {
  items: OrderSummaryItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  title?: string;
  className?: string;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6",
        className,
      )}
    >
      <h2 className="font-display text-lg font-semibold text-cocoa-900">
        {title}
      </h2>

      <ul className="mt-4 divide-y divide-cocoa-900/8">
        {items.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="flex items-start justify-between gap-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-cocoa-900">{item.name}</p>
              <p className="mt-0.5 text-xs text-cocoa-400">
                {item.quantity} × {formatPrice(item.unitPrice)}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-cocoa-900">
              {formatPrice(item.subtotal)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-cocoa-900/10 pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-cocoa-500">Subtotal</dt>
          <dd className="font-medium text-cocoa-900">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-cocoa-500">Delivery</dt>
          <dd className="font-medium text-cocoa-900">
            {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-cocoa-900/10 pt-2">
          <dt className="font-display text-base font-semibold text-cocoa-900">
            Total
          </dt>
          <dd className="font-display text-lg font-semibold text-brand-700">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-cocoa-400">
        Delivery RM6 (Pay Now) or RM2 (COD) · FREE for 5 or more jars.
      </p>
    </section>
  );
}
