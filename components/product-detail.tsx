import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/cart/add-to-cart";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { Badge } from "@/components/ui/badge";
import { COD_DELIVERY_FEE, DELIVERY_FEE, FREE_DELIVERY_MIN_QUANTITY } from "@/lib/delivery";
import type { Category, Product } from "@/lib/types";
import { categoryLabel, formatPrice } from "@/lib/utils";

export function ProductDetail({
  product,
  categories,
}: {
  product: Product;
  categories: Pick<Category, "slug" | "name">[];
}) {
  const label = categoryLabel(product.category, categories);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-sm text-cocoa-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/products"
              className="transition-colors hover:text-brand-700"
            >
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-cocoa-600">{label}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-panel border border-cocoa-900/10 bg-cream-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <ProductImagePlaceholder />
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Badge variant="neutral" className="w-fit">
            {label}
          </Badge>

          <h1 className="font-display text-2xl font-semibold leading-tight text-cocoa-900 sm:text-3xl">
            {product.name}
          </h1>

          <span className="font-display text-2xl font-semibold text-brand-700">
            {formatPrice(product.price)}
          </span>

          {product.description ? (
            <p className="max-w-prose leading-relaxed text-cocoa-600">
              {product.description}
            </p>
          ) : null}

          <AddToCart product={product} />

          <p className="text-xs text-cocoa-500">
            Delivery and payment options are available at checkout.
          </p>

          <p className="text-xs font-medium text-cocoa-600">
            Delivery RM{DELIVERY_FEE.toFixed(2)} (Pay Now) or RM
            {COD_DELIVERY_FEE.toFixed(2)} (COD) · FREE for{" "}
            {FREE_DELIVERY_MIN_QUANTITY}+ jars
          </p>
        </div>
      </div>
    </div>
  );
}
