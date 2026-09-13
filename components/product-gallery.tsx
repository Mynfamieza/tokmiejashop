"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { cn } from "@/lib/utils";

const THUMB_LABELS = ["Main photo", "Inside / contents photo", "Texture / serving photo"];

/**
 * Product photo gallery: main image plus clickable thumbnails for the extra
 * gallery photos (inside/contents, texture/serving) when provided.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-panel border border-cocoa-900/10 bg-cream-100">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            priority={selected === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ProductImagePlaceholder />
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3" role="group" aria-label="Product photos">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              aria-label={`Show ${THUMB_LABELS[index] ?? `photo ${index + 1}`}`}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition",
                selected === index
                  ? "border-brand-700 ring-2 ring-brand-600/30"
                  : "border-cocoa-900/10 hover:border-cocoa-900/30",
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
