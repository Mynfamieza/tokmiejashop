import type { Metadata } from "next";
import Link from "next/link";
import { CategoryForm } from "@/components/dashboard/category-form";

export const metadata: Metadata = { title: "Add category" };
export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
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
          Add category
        </h1>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
