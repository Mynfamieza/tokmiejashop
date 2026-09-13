import type { Metadata } from "next";
import Link from "next/link";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { ProductsList } from "@/components/dashboard/products-list";
import { buttonVariants } from "@/components/ui/button";
import { getOwnerCategories, getOwnerProducts } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function DashboardProductsPage() {
  const [{ products, error }, { categories }] = await Promise.all([
    getOwnerProducts(),
    getOwnerCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-cocoa-900">
            Products
          </h1>
          <p className="text-cocoa-500">
            {products.length} {products.length === 1 ? "product" : "products"} ·
            inactive products are hidden from the storefront.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className={buttonVariants({ size: "md" })}
        >
          Add product
        </Link>
      </header>

      {error ? (
        <DashboardMessage title="Could not load products" description={error} />
      ) : (
        <ProductsList products={products} categories={categories} />
      )}
    </div>
  );
}
