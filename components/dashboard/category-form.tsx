"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  createCategory,
  updateCategory,
} from "@/app/dashboard/categories/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import type { CategoryErrors } from "@/lib/admin-validation";
import type { Category } from "@/lib/types";

export function CategoryForm({
  mode,
  category,
}: {
  mode: "create" | "edit";
  category?: Category;
}) {
  const router = useRouter();

  const [name, setName] = useState(category?.name ?? "");
  const [sortOrder, setSortOrder] = useState(
    category ? String(category.sort_order) : "0",
  );
  const [active, setActive] = useState(category?.active ?? true);
  const [fieldErrors, setFieldErrors] = useState<CategoryErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setMessage(null);
    setFieldErrors({});

    const input = { name, sortOrder, active };
    const result =
      mode === "edit" && category
        ? await updateCategory(category.id, input)
        : await createCategory(input);

    if (!result.ok) {
      setMessage(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setSubmitting(false);
      return;
    }

    router.push("/dashboard/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="category-name">
          Category name <span className="text-brand-700">*</span>
        </Label>
        <Input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "category-name-error" : undefined}
          placeholder="cth. Sambal"
        />
        <FieldError id="category-name-error">{fieldErrors.name}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category-sort">Sort order</Label>
        <Input
          id="category-sort"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.sortOrder)}
          aria-describedby={
            fieldErrors.sortOrder ? "category-sort-error" : undefined
          }
          placeholder="0"
        />
        <FieldError id="category-sort-error">{fieldErrors.sortOrder}</FieldError>
        <p className="text-xs text-cocoa-400">
          Lower numbers appear first in the storefront category navigation.
        </p>
      </div>

      <div className="rounded-xl border border-cocoa-900/10 bg-cream-50 px-4 py-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            disabled={submitting}
            className="h-5 w-5 rounded border-cocoa-900/20 text-brand-700 focus:ring-brand-600/20"
          />
          <span className="text-sm font-medium text-cocoa-800">
            Active (selectable on the storefront)
          </span>
        </label>
      </div>

      {message ? (
        <p
          role="alert"
          className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Add category"
              : "Save changes"}
        </Button>
        <Link
          href="/dashboard/categories"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
