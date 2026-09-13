"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { BowlIcon } from "@/components/icons";
import {
  IMAGE_SIZE_ERROR,
  IMAGE_TYPE_ERROR,
  isAllowedImageMime,
  MAX_IMAGE_BYTES,
} from "@/lib/image-upload";

export function ImageUploadField({
  currentUrl,
  label = "Product image",
  disabled,
  onFileSelected,
  onRemove,
}: {
  currentUrl: string;
  label?: string;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const shownUrl = previewUrl ?? (currentUrl || null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    if (!isAllowedImageMime(file.type)) {
      setError(IMAGE_TYPE_ERROR);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(IMAGE_SIZE_ERROR);
      return;
    }

    setError(null);
    setFileName(file.name);
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    onFileSelected(file);
  }

  function handleRemove() {
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setFileName(null);
    setError(null);
    onRemove();
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-cocoa-800">{label}</span>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-cocoa-900/20 bg-cream-50 p-4">
        <div className="relative aspect-square w-full max-w-[14rem] overflow-hidden rounded-xl border border-cocoa-900/10 bg-cream-100">
          {shownUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownUrl}
              alt="Product image preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-cocoa-300">
              <BowlIcon className="h-9 w-9" strokeWidth={1.3} />
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em]">
                No image yet
              </span>
            </span>
          )}
        </div>

        {fileName ? (
          <p className="max-w-full truncate text-xs text-cocoa-400">
            {fileName}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="rounded-full border border-cocoa-900/15 bg-white px-4 py-2 text-sm font-medium text-cocoa-700 transition hover:border-brand-700/40 hover:text-brand-700 disabled:opacity-60"
          >
            {shownUrl ? "Change image" : "Upload product image"}
          </button>
          {shownUrl ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="rounded-full px-4 py-2 text-sm font-medium text-cocoa-500 transition hover:text-brand-700 disabled:opacity-60"
            >
              Remove image
            </button>
          ) : null}
        </div>

        <p className="text-xs text-cocoa-400">JPG, PNG or WebP · Max 5 MB</p>

        {error ? (
          <p role="alert" className="text-xs font-medium text-brand-700">
            {error}
          </p>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleChange}
          disabled={disabled}
          aria-label="Choose product image"
        />
      </div>
    </div>
  );
}
