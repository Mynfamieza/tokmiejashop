import Link from "next/link";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryNav({
  categories,
  active = null,
  basePath = "/products",
}: {
  categories: Pick<Category, "slug" | "name">[];
  active?: string | null;
  basePath?: string;
}) {
  return (
    <nav aria-label="Kategori" className="flex flex-wrap gap-2">
      <Pill href={basePath} label="All" active={!active} />
      {categories.map((category) => (
        <Pill
          key={category.slug}
          href={`${basePath}?category=${category.slug}`}
          label={category.name}
          active={active === category.slug}
        />
      ))}
    </nav>
  );
}

function Pill({
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
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand-700 bg-brand-700 text-cream-50"
          : "border-cocoa-900/12 bg-white text-cocoa-700 hover:border-cocoa-900/25",
      )}
    >
      {label}
    </Link>
  );
}
