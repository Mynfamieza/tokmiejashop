import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/dashboard/product-form";
import { getOwnerCategories } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Add product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { categories } = await getOwnerCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/products"
          className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
        >
          ← Back to products
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold text-cocoa-900">
          Add product
        </h1>
        <p className="mt-1 text-cocoa-500">
          New products go live immediately when marked active.
        </p>
      </div>

      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
