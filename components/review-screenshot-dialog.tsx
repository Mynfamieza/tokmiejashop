"use client";

import Image from "next/image";
import { useId, useRef, type MouseEvent } from "react";
import { ArrowRightIcon, CloseIcon } from "@/components/icons";
import type { ReviewScreenshot } from "@/lib/customer-reviews";

export function ReviewScreenshotDialog({
  customer,
  isSample,
  screenshot,
}: {
  customer: string;
  isSample: boolean;
  screenshot: ReviewScreenshot | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    ) {
      dialogRef.current?.close();
    }
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`View Original screenshot for ${customer}${isSample ? " (sample preview)" : ""}`}
        onClick={() => dialogRef.current?.showModal()}
        className="mt-5 inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border border-brand-700/15 px-4 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-700/30 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
      >
        View Original
        <ArrowRightIcon className="h-4 w-4" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={closeOnBackdrop}
        className="m-auto max-h-[90dvh] w-[90vw] max-w-2xl overflow-y-auto overscroll-contain rounded-panel border border-cocoa-900/10 bg-cream-50 p-0 text-cocoa-900 shadow-xl backdrop:bg-cocoa-950/60 backdrop:backdrop-blur-sm"
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-cocoa-900/10 bg-cream-50 px-5 py-4 sm:px-7">
          <div>
            <h3 id={titleId} className="font-display text-xl font-semibold">Original Shopee review</h3>
            <p id={descriptionId} className="mt-1 text-sm text-cocoa-500">
              {isSample ? "Sample preview only · not a genuine customer review" : `Review shared by ${customer}`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close review screenshot"
            onClick={() => dialogRef.current?.close()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cocoa-900/10 bg-white text-cocoa-700 transition-colors hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 sm:p-7">
          {screenshot ? (
            <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} unoptimized className="h-auto w-full rounded-xl" />
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-brand-700/20 bg-cream-100 px-6 py-10 text-center">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                {isSample ? "Sample preview" : "Screenshot unavailable"}
              </span>
              <p className="font-display text-xl font-semibold text-cocoa-900">No original screenshot yet</p>
              <p className="max-w-sm text-sm leading-relaxed text-cocoa-600">
                {isSample
                  ? "This is a layout placeholder. The original Shopee screenshot will appear here once the owner provides it."
                  : "The original review screenshot has not been added yet."}
              </p>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
