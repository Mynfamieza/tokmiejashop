"use client";

import Image from "next/image";
import { useId, useRef, type MouseEvent } from "react";
import { ArrowRightIcon, CloseIcon } from "@/components/icons";
import type { ReviewScreenshot } from "@/lib/customer-reviews";

export function ReviewScreenshotDialog({
  customer,
  screenshot,
}: {
  customer: string;
  screenshot: ReviewScreenshot;
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
        aria-label={`View Original screenshot for ${customer}`}
        onClick={() => dialogRef.current?.showModal()}
        className="mt-3 inline-flex min-h-11 items-center justify-between gap-2 rounded-xl border border-brand-700/15 px-3 text-xs font-semibold text-brand-700 transition-colors hover:border-brand-700/30 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:min-h-9"
      >
        View Original
        <ArrowRightIcon className="h-3.5 w-3.5" />
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
              {customer} · Username and profile photo hidden for privacy
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
          <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} unoptimized className="h-auto w-full rounded-xl" />
        </div>
      </dialog>
    </>
  );
}
