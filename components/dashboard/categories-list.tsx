import Link from "next/link";
import { CategoryActiveToggle } from "@/components/dashboard/category-active-toggle";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/types";

const EDIT_LINK_CLASS =
  "rounded-full border border-cocoa-900/15 px-3 py-1.5 text-xs font-medium text-cocoa-700 transition hover:border-brand-700/40 hover:text-brand-700";

export function CategoriesList({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<string, number>;
}) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-panel border border-cocoa-900/10 bg-white px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-cocoa-900">
          No categories yet
        </p>
        <p className="text-sm text-cocoa-500">
          Create a category so products can be grouped on the storefront.
        </p>
        <Link
          href="/dashboard/categories/new"
          className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-brand-800"
        >
          Add category
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-panel border border-cocoa-900/10 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cocoa-900/10 text-xs uppercase tracking-wide text-cocoa-400">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Sort order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-900/8">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-cocoa-900">{category.name}</p>
                  <p className="text-xs text-cocoa-400">/{category.slug}</p>
                </td>
                <td className="px-4 py-3 text-cocoa-600">
                  {productCounts[category.slug] ?? 0}
                </td>
                <td className="px-4 py-3 text-cocoa-600">
                  {category.sort_order}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={category.active ? "success" : "neutral"}>
                    {category.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/categories/${category.id}/edit`}
                      className={EDIT_LINK_CLASS}
                    >
                      Edit
                    </Link>
                    <CategoryActiveToggle
                      id={category.id}
                      active={category.active}
                      name={category.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="flex flex-col gap-3 md:hidden">
        {categories.map((category) => (
          <li
            key={category.id}
            className="rounded-panel border border-cocoa-900/10 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-cocoa-900">{category.name}</p>
                <p className="text-xs text-cocoa-400">/{category.slug}</p>
              </div>
              <Badge variant={category.active ? "success" : "neutral"}>
                {category.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-cocoa-500">
              <span>{productCounts[category.slug] ?? 0} products</span>
              <span>Sort order {category.sort_order}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/categories/${category.id}/edit`}
                className={EDIT_LINK_CLASS}
              >
                Edit
              </Link>
              <CategoryActiveToggle
                id={category.id}
                active={category.active}
                name={category.name}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
