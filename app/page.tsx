import Link from "next/link";
import { CategoryNav } from "@/components/category-nav";
import { DataError } from "@/components/data-error";
import { EmptyState } from "@/components/empty-state";
import { ArrowRightIcon } from "@/components/icons";
import { PreviewNotice } from "@/components/preview-notice";
import { ProductCard } from "@/components/product-card";
import { ShopIntro } from "@/components/shop-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import {
  getStorefrontCategoriesWithProducts,
  getStorefrontProducts,
  pickFeaturedProduct,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
  const highlight = pickFeaturedProduct(products);
  const usingPreview =
    productsResult.usingPreview || categoriesResult.usingPreview;
  const error = productsResult.error ?? categoriesResult.error;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        <ShopIntro />

        <div className="container-page">
          <CategoryNav categories={categories} />
        </div>

        {usingPreview || error ? (
          <div className="container-page mt-6 flex flex-col gap-3">
            {usingPreview ? <PreviewNotice /> : null}
            {error ? <DataError message={error} /> : null}
          </div>
        ) : null}

        <section className="container-page pt-8 sm:pt-10">
          {highlight ? (
            <ProductCard
              variant="feature"
              product={highlight}
              categories={categories}
            />
          ) : (
            <EmptyState
              title="Nothing featured yet"
              description="Check the shop for everything that is currently available."
            />
          )}

          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              Shop all products
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section
          id="about"
          className="container-page scroll-mt-24 pt-16 sm:pt-20"
        >
          <div className="rounded-panel border border-cocoa-900/10 bg-cream-100 px-6 py-10 sm:px-10 sm:py-12">
            <SectionHeading
              eyebrow="About TokMieja"
              title="Made for everyday eating."
              description="TokMieja makes food products that are easy to enjoy with everyday meals."
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
