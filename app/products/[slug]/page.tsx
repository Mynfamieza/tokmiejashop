import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataError } from "@/components/data-error";
import { PreviewNotice } from "@/components/preview-notice";
import { ProductDetail } from "@/components/product-detail";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getActiveCategories, getProductBySlug } from "@/lib/catalog";
import {
  getStorefrontCategories,
  isStorefrontCategoryActive,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [result, categoriesResult] = await Promise.all([
    getProductBySlug(slug),
    getActiveCategories(),
  ]);

  if (
    !result.data ||
    !isStorefrontCategoryActive(result.data.category, categoriesResult.data)
  ) {
    return { title: "Product not found" };
  }

  const product = result.data;
  const description =
    product.description ??
    `Buy ${product.name} from the TokMieja online store.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      ...(product.image_url
        ? { images: [{ url: product.image_url, alt: product.name }] }
        : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const [productResult, categoriesResult] = await Promise.all([
    getProductBySlug(slug),
    getActiveCategories(),
  ]);

  const product = productResult.data;
  const categories = getStorefrontCategories(categoriesResult.data);
  const usingPreview =
    productResult.usingPreview || categoriesResult.usingPreview;
  const error = productResult.error ?? categoriesResult.error;

  if (error && !product) {
    return (
      <div className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="container-page flex-1 py-10 sm:py-14">
          <DataError message={error} />
          <Link
            href="/products"
            className="mt-6 inline-block text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            Back to shop
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (
    !product ||
    !isStorefrontCategoryActive(product.category, categoriesResult.data)
  ) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="container-page flex-1 py-8 sm:py-12">
        {usingPreview ? (
          <div className="mb-6">
            <PreviewNotice />
          </div>
        ) : null}
        <ProductDetail product={product} categories={categories} />
      </main>
      <SiteFooter />
    </div>
  );
}
