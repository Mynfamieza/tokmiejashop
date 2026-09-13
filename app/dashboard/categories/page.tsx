import type { Metadata } from "next";
import Link from "next/link";
import { CategoriesList } from "@/components/dashboard/categories-list";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { buttonVariants } from "@/components/ui/button";
import { getOwnerCategories, getOwnerProducts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function DashboardCategoriesPage() {
  const [{ categories, error }, { products }] = await Promise.all([
    getOwnerCategories(),
    getOwnerProducts(),
  ]);

  const productCounts: Record<string, number> = {};
  for (const product of products) {
    productCounts[product.category] =
      (productCounts[product.category] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-cocoa-900">
            Categories
          </h1>
          <p className="text-cocoa-500">
            Inactive categories and their products are hidden from the
            storefront.
          </p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className={buttonVariants({ size: "md" })}
        >
          Add category
        </Link>
      </header>

      {error ? (
        <DashboardMessage title="Could not load categories" description={error} />
      ) : (
        <CategoriesList
          categories={categories}
          productCounts={productCounts}
        />
      )}
    </div>
  );
}
