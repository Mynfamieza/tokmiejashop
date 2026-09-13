/**
 * Pure validation + normalization for owner product/category forms.
 * Server actions re-run these, so client validation is never trusted.
 */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ProductInput = {
  name: string;
  price: string;
  costPrice: string;
  stockQuantity: string;
  category: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
};

export type ProductField =
  | "name"
  | "price"
  | "costPrice"
  | "stockQuantity"
  | "category"
  | "description"
  | "imageUrl";

export type ProductErrors = Partial<Record<ProductField, string>>;

export type NormalizedProduct = {
  name: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  category: string;
  description: string | null;
  image_url: string | null;
  featured: boolean;
  active: boolean;
};

export function validateProductInput(input: ProductInput): {
  values: NormalizedProduct;
  errors: ProductErrors;
} {
  const errors: ProductErrors = {};

  const name = (input.name ?? "").trim();
  if (!name) errors.name = "Product name is required.";
  else if (name.length > 120) errors.name = "Product name is too long.";
  else if (!slugify(name))
    errors.name = "Please use letters or numbers in the name.";

  const priceRaw = String(input.price ?? "").trim();
  const price = Number(priceRaw);
  if (!priceRaw) errors.price = "Price is required.";
  else if (!Number.isFinite(price) || price < 0)
    errors.price = "Price must be 0 or more.";
  else if (price > 9999999.99) errors.price = "Price is too large.";

  const stockRaw = String(input.stockQuantity ?? "").trim();
  const stock = Number(stockRaw);
  if (!stockRaw) errors.stockQuantity = "Stock quantity is required.";
  else if (!Number.isInteger(stock) || stock < 0)
    errors.stockQuantity = "Stock must be a whole number, 0 or more.";
  else if (stock > 1000000) errors.stockQuantity = "Stock quantity is too large.";

  // Optional estimated cost per unit. Empty is treated as 0 (unknown).
  const costRaw = String(input.costPrice ?? "").trim();
  const cost = costRaw === "" ? 0 : Number(costRaw);
  if (costRaw !== "" && (!Number.isFinite(cost) || cost < 0))
    errors.costPrice = "Estimated cost must be 0 or more.";
  else if (cost > 9999999.99) errors.costPrice = "Estimated cost is too large.";

  const category = (input.category ?? "").trim();
  if (!category) errors.category = "Please choose a category.";

  const description = (input.description ?? "").trim();
  if (description.length > 2000) errors.description = "Description is too long.";

  const imageUrl = (input.imageUrl ?? "").trim();
  if (imageUrl && !/^https?:\/\/.+/i.test(imageUrl)) {
    errors.imageUrl = "Image URL must start with http:// or https://.";
  }

  return {
    values: {
      name,
      price: Number.isFinite(price) ? Math.round(price * 100) / 100 : 0,
      cost_price: Number.isFinite(cost) ? Math.round(cost * 100) / 100 : 0,
      stock_quantity: Number.isFinite(stock) ? Math.trunc(stock) : 0,
      category,
      description: description || null,
      image_url: imageUrl || null,
      featured: Boolean(input.featured),
      active: Boolean(input.active),
    },
    errors,
  };
}

export function hasProductErrors(errors: ProductErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type CategoryInput = {
  name: string;
  sortOrder: string;
  active: boolean;
};

export type CategoryField = "name" | "sortOrder";
export type CategoryErrors = Partial<Record<CategoryField, string>>;

export type NormalizedCategory = {
  name: string;
  sort_order: number;
  active: boolean;
};

export function validateCategoryInput(input: CategoryInput): {
  values: NormalizedCategory;
  errors: CategoryErrors;
} {
  const errors: CategoryErrors = {};

  const name = (input.name ?? "").trim();
  if (!name) errors.name = "Category name is required.";
  else if (name.length > 80) errors.name = "Category name is too long.";
  else if (!slugify(name))
    errors.name = "Please use letters or numbers in the name.";

  const sortRaw = String(input.sortOrder ?? "").trim();
  const sort = Number(sortRaw === "" ? "0" : sortRaw);
  if (!Number.isInteger(sort) || sort < 0 || sort > 100000) {
    errors.sortOrder = "Sort order must be a whole number, 0 or more.";
  }

  return {
    values: {
      name,
      sort_order: Number.isFinite(sort) ? Math.trunc(sort) : 0,
      active: Boolean(input.active),
    },
    errors,
  };
}

export function hasCategoryErrors(errors: CategoryErrors): boolean {
  return Object.keys(errors).length > 0;
}
