"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ImageUploadField } from "@/components/dashboard/image-upload-field";
import {
  deleteProductImage,
  uploadProductImage,
} from "@/app/dashboard/products/image-actions";
import { createProduct, updateProduct } from "@/app/dashboard/products/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import {
  hasProductErrors,
  validateProductInput,
  type ProductErrors,
} from "@/lib/admin-validation";
import type { Category, Product } from "@/lib/types";

type Phase = "idle" | "uploading" | "saving";

export function ProductForm({
  mode,
  product,
  categories,
}: {
  mode: "create" | "edit";
  product?: Product;
  categories: Pick<Category, "slug" | "name">[];
}) {
  const router = useRouter();

  const existingImageUrl = product?.image_url ?? "";

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [costPrice, setCostPrice] = useState(
    product ? String(product.cost_price ?? "") : "",
  );
  const [stockQuantity, setStockQuantity] = useState(
    product ? String(product.stock_quantity) : "0",
  );
  const [category, setCategory] = useState(
    product?.category ?? categories[0]?.slug ?? "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<ProductErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const submitting = phase !== "idle";

  function handleFileSelected(file: File) {
    setImageFile(file);
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setRemoveImage(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setMessage(null);
    setFieldErrors({});

    // Client-side field validation first (server re-validates).
    const preview = {
      name,
      price,
      costPrice,
      stockQuantity,
      category,
      description,
      imageUrl: removeImage ? "" : existingImageUrl,
      featured,
      active,
    };
    const check = validateProductInput(preview);
    if (hasProductErrors(check.errors)) {
      setFieldErrors(check.errors);
      setMessage("Please fix the highlighted fields.");
      return;
    }

    let finalImageUrl = removeImage ? "" : existingImageUrl;
    let uploadedPath: string | null = null;

    if (imageFile) {
      setPhase("uploading");
      const formData = new FormData();
      formData.append("file", imageFile);
      if (product) formData.append("productId", product.id);

      const upload = await uploadProductImage(formData);
      if (!upload.ok) {
        setMessage(upload.message);
        setPhase("idle");
        return;
      }
      finalImageUrl = upload.url;
      uploadedPath = upload.path;
    }

    setPhase("saving");
    const input = {
      name,
      price,
      costPrice,
      stockQuantity,
      category,
      description,
      imageUrl: finalImageUrl,
      featured,
      active,
    };

    const result =
      mode === "edit" && product
        ? await updateProduct(product.id, input)
        : await createProduct(input);

    if (!result.ok) {
      // Do not leave a freshly uploaded file orphaned if saving failed.
      if (uploadedPath) await deleteProductImage(uploadedPath);
      setMessage(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setPhase("idle");
      return;
    }

    // Old image is removed only after the new one is stored and saved.
    if (
      (imageFile || removeImage) &&
      existingImageUrl &&
      existingImageUrl !== finalImageUrl
    ) {
      await deleteProductImage(existingImageUrl);
    }

    router.push("/dashboard/products");
    router.refresh();
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-panel border border-cocoa-900/10 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-cocoa-900">
          Add a category first
        </h2>
        <p className="mt-2 text-sm text-cocoa-500">
          Every product needs a category. Create one before adding products.
        </p>
        <Link
          href="/dashboard/categories/new"
          className={`${buttonVariants({ size: "md" })} mt-4`}
        >
          Add category
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="product-name">
          Product name <span className="text-brand-700">*</span>
        </Label>
        <Input
          id="product-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "product-name-error" : undefined}
          placeholder="cth. Sambal Garing Bilis Pucuk Ubi"
        />
        <FieldError id="product-name-error">{fieldErrors.name}</FieldError>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="product-price">
            Price (RM) <span className="text-brand-700">*</span>
          </Label>
          <Input
            id="product-price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.price)}
            aria-describedby={
              fieldErrors.price ? "product-price-error" : undefined
            }
            placeholder="0.00"
          />
          <FieldError id="product-price-error">{fieldErrors.price}</FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="product-cost">
            Cost / unit (RM){" "}
            <span className="font-normal text-cocoa-500">(optional)</span>
          </Label>
          <Input
            id="product-cost"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={costPrice}
            onChange={(event) => setCostPrice(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.costPrice)}
            aria-describedby={
              fieldErrors.costPrice ? "product-cost-error" : undefined
            }
            placeholder="0.00"
          />
          <FieldError id="product-cost-error">
            {fieldErrors.costPrice}
          </FieldError>
          <p className="text-xs text-cocoa-500">
            Used only to estimate profit.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="product-stock">
            Stock quantity <span className="text-brand-700">*</span>
          </Label>
          <Input
            id="product-stock"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            value={stockQuantity}
            onChange={(event) => setStockQuantity(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.stockQuantity)}
            aria-describedby={
              fieldErrors.stockQuantity ? "product-stock-error" : undefined
            }
            placeholder="0"
          />
          <FieldError id="product-stock-error">
            {fieldErrors.stockQuantity}
          </FieldError>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-category">
          Category <span className="text-brand-700">*</span>
        </Label>
        <select
          id="product-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          disabled={submitting}
          aria-invalid={Boolean(fieldErrors.category)}
          aria-describedby={
            fieldErrors.category ? "product-category-error" : undefined
          }
          className="h-12 w-full rounded-xl border border-cocoa-900/15 bg-white px-4 text-base text-cocoa-900 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10 disabled:opacity-60"
        >
          <option value="">Choose a category…</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <FieldError id="product-category-error">
          {fieldErrors.category}
        </FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="product-description">
          Description{" "}
          <span className="font-normal text-cocoa-400">(optional)</span>
        </Label>
        <Textarea
          id="product-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={submitting}
          maxLength={2000}
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={
            fieldErrors.description ? "product-description-error" : undefined
          }
          placeholder="Short, editable description"
        />
        <FieldError id="product-description-error">
          {fieldErrors.description}
        </FieldError>
      </div>

      <ImageUploadField
        currentUrl={removeImage ? "" : existingImageUrl}
        disabled={submitting}
        onFileSelected={handleFileSelected}
        onRemove={handleRemoveImage}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-cocoa-900/10 bg-cream-50 px-4 py-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            disabled={submitting}
            className="h-5 w-5 rounded border-cocoa-900/20 text-brand-700 focus:ring-brand-600/20"
          />
          <span className="text-sm font-medium text-cocoa-800">
            Featured on the homepage
          </span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            disabled={submitting}
            className="h-5 w-5 rounded border-cocoa-900/20 text-brand-700 focus:ring-brand-600/20"
          />
          <span className="text-sm font-medium text-cocoa-800">
            Active (visible on the storefront)
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
          {phase === "uploading"
            ? "Uploading image..."
            : phase === "saving"
              ? "Saving product..."
              : mode === "create"
                ? "Add product"
                : "Save changes"}
        </Button>
        <Link
          href="/dashboard/products"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
