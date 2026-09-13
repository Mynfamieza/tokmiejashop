import type { Category, Product } from "@/lib/types";

/**
 * Storefront visibility follows the database `active`/`featured` flags, so
 * owner changes in the dashboard are reflected on the public storefront.
 */

/** Categories that are active. */
export function getStorefrontCategories(categories: Category[]): Category[] {
  return categories.filter((category) => category.active);
}

/**
 * Active categories that currently have at least one active product.
 * Used for the public category navigation.
 */
export function getStorefrontCategoriesWithProducts(
  categories: Category[],
  products: Product[],
): Category[] {
  const active = getStorefrontCategories(categories);
  const activeSlugs = new Set(active.map((category) => category.slug));

  const counts = new Map<string, number>();
  for (const product of products) {
    if (activeSlugs.has(product.category)) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
  }

  return active.filter((category) => (counts.get(category.slug) ?? 0) > 0);
}

/** Active products whose category is also active. */
export function getStorefrontProducts(
  products: Product[],
  categories: Category[],
): Product[] {
  const activeSlugs = new Set(
    getStorefrontCategories(categories).map((category) => category.slug),
  );
  return products.filter((product) => activeSlugs.has(product.category));
}

/** True when the given category slug is active (resolvable on the storefront). */
export function isStorefrontCategoryActive(
  slug: string,
  categories: Category[],
): boolean {
  return categories.some(
    (category) => category.active && category.slug === slug,
  );
}

/**
 * The product highlighted on the homepage: the first product flagged
 * `featured` in the database. Returns null when nothing is featured so the
 * page can show an intentional empty state instead of inventing a product.
 */
export function pickFeaturedProduct(products: Product[]): Product | null {
  return products.find((product) => product.featured) ?? null;
}
