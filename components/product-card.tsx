import Image from "next/image";
import Link from "next/link";
import { QuickAddButton } from "@/components/cart/quick-add-button";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { Badge } from "@/components/ui/badge";
import type { Category, Product } from "@/lib/types";
import { categoryLabel, formatPrice } from "@/lib/utils";

export type ProductCardProps = {
  product: Product;
  categories?: Pick<Category, "slug" | "name">[];
  variant?: "default" | "feature";
};

export function ProductCard({
  product,
  categories = [],
  variant = "default",
}: ProductCardProps) {
  if (variant === "feature") {
    return <FeatureCard product={product} categories={categories} />;
  }

  return <DefaultCard product={product} categories={categories} />;
}

function DefaultCard({
  product,
  categories = [],
}: Omit<ProductCardProps, "variant">) {
  const label = categoryLabel(product.category, categories);
  const href = `/products/${product.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-cocoa-900/10 bg-white transition duration-300 hover:border-cocoa-900/20 hover:shadow-soft">
      <Link
        href={href}
        aria-label={`View ${product.name}`}
        className="block aspect-square"
      >
        <ProductMedia
          product={product}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cocoa-500">
          {label}
        </span>
        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-cocoa-900">
          <Link href={href} className="transition-colors hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-[0.95rem] font-semibold text-cocoa-900">
            {formatPrice(product.price)}
          </span>
          <QuickAddButton product={product} />
        </div>
      </div>
    </article>
  );
}

function FeatureCard({
  product,
  categories = [],
}: Omit<ProductCardProps, "variant">) {
  const label = categoryLabel(product.category, categories);
  const href = `/products/${product.slug}`;

  return (
    <article className="group grid overflow-hidden rounded-panel border border-cocoa-900/10 bg-white md:grid-cols-2">
      <Link
        href={href}
        aria-label={`View ${product.name}`}
        className="relative block aspect-square md:aspect-auto md:min-h-[26rem]"
      >
        <ProductMedia
          product={product}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </Link>

      <div className="flex flex-col justify-center gap-4 p-6 sm:p-9">
        <Badge variant="neutral" className="w-fit">
          {label}
        </Badge>

        <h2 className="font-display text-2xl font-semibold leading-tight text-cocoa-900 sm:text-3xl">
          <Link href={href} className="transition-colors hover:text-brand-700">
            {product.name}
          </Link>
        </h2>

        {product.description ? (
          <p className="max-w-md leading-relaxed text-cocoa-600">
            {product.description}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-4">
          <span className="font-display text-2xl font-semibold text-brand-700">
            {formatPrice(product.price)}
          </span>
          <QuickAddButton product={product} large />
          <Link
            href={href}
            className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductMedia({
  product,
  sizes,
}: {
  product: Product;
  sizes: string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-cream-100">
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <ProductImagePlaceholder />
      )}
    </div>
  );
}
