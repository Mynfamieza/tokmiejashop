import type { Metadata } from "next";
import Link from "next/link";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { ProductForm } from "@/components/dashboard/product-form";
import { getOwnerCategories, getOwnerProductById } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { product } = await getOwnerProductById(id);
  return { title: product ? `Edit ${product.name}` : "Edit product" };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ product, error }, { categories }] = await Promise.all([
    getOwnerProductById(id),
    getOwnerCategories(),
  ]);

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
          Edit product
        </h1>
      </div>

      {error ? (
        <DashboardMessage title="Could not load product" description={error} />
      ) : !product ? (
        <DashboardMessage
          title="Product not found"
          description="This product may have been removed."
        />
      ) : (
        <ProductForm
          mode="edit"
          product={product}
          categories={categories}
        />
      )}
    </div>
  );
}
