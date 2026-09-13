import Image from "next/image";
import Link from "next/link";
import { ProductActiveToggle } from "@/components/dashboard/product-active-toggle";
import { BowlIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import type { Category, Product } from "@/lib/types";
import { categoryLabel, cn, formatPrice } from "@/lib/utils";

const EDIT_LINK_CLASS =
  "rounded-full border border-cocoa-900/15 px-3 py-1.5 text-xs font-medium text-cocoa-700 transition hover:border-brand-700/40 hover:text-brand-700";

export function ProductsList({
  products,
  categories,
}: {
  products: Product[];
  categories: Pick<Category, "slug" | "name">[];
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-panel border border-cocoa-900/10 bg-white px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-cocoa-900">
          No products yet
        </p>
        <p className="text-sm text-cocoa-500">
          Add your first product to start selling.
        </p>
        <Link
          href="/dashboard/products/new"
          className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-brand-800"
        >
          Add product
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-panel border border-cocoa-900/10 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cocoa-900/10 text-xs uppercase tracking-wide text-cocoa-400">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-900/8">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductThumb product={product} />
                    <div className="min-w-0">
                      <p className="font-medium text-cocoa-900">{product.name}</p>
                      <p className="text-xs text-cocoa-400">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-cocoa-600">
                  {categoryLabel(product.category, categories)}
                </td>
                <td className="px-4 py-3 font-medium text-cocoa-900">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3 text-cocoa-600">
                  {product.stock_quantity}
                </td>
                <td className="px-4 py-3">
                  <StatusBadges product={product} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className={EDIT_LINK_CLASS}
                    >
                      Edit
                    </Link>
                    <ProductActiveToggle
                      id={product.id}
                      active={product.active}
                      name={product.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="flex flex-col gap-3 md:hidden">
        {products.map((product) => (
          <li
            key={product.id}
            className="rounded-panel border border-cocoa-900/10 bg-white p-4"
          >
            <div className="flex gap-3">
              <ProductThumb product={product} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-cocoa-900">{product.name}</p>
                <p className="text-xs text-cocoa-400">
                  {categoryLabel(product.category, categories)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium text-cocoa-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-cocoa-500">
                    Stock {product.stock_quantity}
                  </span>
                </div>
                <div className="mt-2">
                  <StatusBadges product={product} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className={EDIT_LINK_CLASS}
                  >
                    Edit
                  </Link>
                  <ProductActiveToggle
                    id={product.id}
                    active={product.active}
                    name={product.name}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function StatusBadges({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={product.active ? "success" : "neutral"}>
        {product.active ? "Active" : "Inactive"}
      </Badge>
      {product.featured ? <Badge variant="accent">Featured</Badge> : null}
    </div>
  );
}

function ProductThumb({ product }: { product: Product }) {
  return (
    <div
      className={cn(
        "relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-cocoa-900/10 bg-cream-100",
      )}
    >
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="44px"
          className="object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center text-cocoa-300">
          <BowlIcon className="h-5 w-5" strokeWidth={1.4} />
        </span>
      )}
    </div>
  );
}
