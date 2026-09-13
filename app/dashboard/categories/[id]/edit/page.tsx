import type { Metadata } from "next";
import Link from "next/link";
import { CategoryForm } from "@/components/dashboard/category-form";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { getOwnerCategoryById } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { category } = await getOwnerCategoryById(id);
  return { title: category ? `Edit ${category.name}` : "Edit category" };
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { category, error } = await getOwnerCategoryById(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/categories"
          className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
        >
          ← Back to categories
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold text-cocoa-900">
          Edit category
        </h1>
      </div>

      {error ? (
        <DashboardMessage
          title="Could not load category"
          description={error}
        />
      ) : !category ? (
        <DashboardMessage
          title="Category not found"
          description="This category may have been removed."
        />
      ) : (
        <CategoryForm mode="edit" category={category} />
      )}
    </div>
  );
}
