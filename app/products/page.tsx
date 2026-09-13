import type { Metadata } from "next";
import Link from "next/link";
import { CategoryNav } from "@/components/category-nav";
import { DataError } from "@/components/data-error";
import { EmptyState } from "@/components/empty-state";
import { PreviewNotice } from "@/components/preview-notice";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import {
  getStorefrontCategoriesWithProducts,
  getStorefrontProducts,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse all sambal and everyday food available from TokMieja.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Shop",
    description:
      "Browse all sambal and everyday food available from TokMieja.",
    url: "/products",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [productsResult, categoriesResult] = await Promise.all([
    getActiveProducts(),
    getActiveCategories(),
  ]);

  const products = getStorefrontProducts(
    productsResult.data,
    categoriesResult.data,
  );
  const categories = getStorefrontCategoriesWithProducts(
    categoriesResult.data,
    products,
  );
  const selected = category?.trim() || null;
  const visibleProducts = selected
    ? products.filter((product) => product.category === selected)
    : products;
  const selectedLabel =
    categories.find((item) => item.slug === selected)?.name ?? null;
  const usingPreview =
    productsResult.usingPreview || categoriesResult.usingPreview;
  const error = productsResult.error ?? categoriesResult.error;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-10 sm:py-14">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            TokMieja Shop
          </p>
          <h1 className="font-display text-2xl font-semibold text-cocoa-900 sm:text-3xl">
            {selectedLabel ?? "All products"}
          </h1>
          <p className="text-cocoa-500">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "product" : "products"}
            {selectedLabel ? ` in ${selectedLabel}` : ""}
          </p>
        </header>

        {usingPreview || error ? (
          <div className="mt-6 flex flex-col gap-3">
            {usingPreview ? <PreviewNotice /> : null}
            {error ? <DataError message={error} /> : null}
          </div>
        ) : null}

        <div className="mt-6">
          <CategoryNav categories={categories} active={selected} />
        </div>

        <div className="mt-8">
          {visibleProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categories={categories}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products found"
              description={
                selected
                  ? "Try another category or view all products."
                  : "Products will appear here once they are available."
              }
              action={
                selected ? (
                  <Link
                    href="/products"
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    View all products
                  </Link>
                ) : null
              }
            />
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
