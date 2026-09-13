import Link from "next/link";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderFilters({ active }: { active: string | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip href="/dashboard/orders" label="All" active={!active} />
      {ORDER_STATUSES.map((status) => (
        <FilterChip
          key={status}
          href={`/dashboard/orders?status=${status}`}
          label={ORDER_STATUS_LABELS[status]}
          active={active === status}
        />
      ))}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-700 bg-brand-700 text-cream-50"
          : "border-cocoa-900/12 bg-white text-cocoa-700 hover:border-cocoa-900/25",
      )}
    >
      {label}
    </Link>
  );
}
