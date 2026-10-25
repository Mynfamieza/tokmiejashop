"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { ReviewScreenshotDialog } from "@/components/review-screenshot-dialog";
import type { CustomerReview } from "@/lib/customer-reviews";

export function CustomerReviewsCarousel({ reviews }: { reviews: CustomerReview[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const railId = useId();
  const [position, setPosition] = useState({ first: 0, visible: 1 });

  const updatePosition = useCallback(() => {
    const rail = railRef.current;
    const card = rail?.firstElementChild;
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    if (step <= 0) return;
    const visible = Math.max(1, Math.round((rail.clientWidth + gap) / step));
    const first = Math.max(0, Math.min(Math.round(rail.scrollLeft / step), reviews.length - visible));
    setPosition((current) => current.first === first && current.visible === visible
      ? current : { first, visible });
  }, [reviews.length]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [updatePosition]);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    const card = rail?.firstElementChild;
    if (!rail || !card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const target = Math.max(0, Math.min(position.first + direction, reviews.length - position.visible));
    rail.scrollTo({
      left: target * step,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <div className="mt-4" role="region" aria-roledescription="carousel" aria-label="Shopee customer reviews">
      <div
        ref={railRef}
        id={railId}
        onScroll={updatePosition}
        className="-mx-1 grid auto-cols-[100%] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory p-1 [scrollbar-width:none] motion-reduce:scroll-auto sm:gap-4 md:auto-cols-[calc((100%_-_2rem)/3)] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review, index) => (
          <article key={review.id} aria-label={`Review ${index + 1} of ${reviews.length}`} className="flex min-h-52 min-w-0 snap-start flex-col rounded-card border border-cocoa-900/10 bg-white p-4 shadow-soft lg:p-5">
            <div role="img" aria-label={`${review.rating} out of 5 stars`} className="flex gap-0.5 text-mango-500">
              {Array.from({ length: 5 }, (_, star) => (
                <svg key={star} viewBox="0 0 24 24" aria-hidden="true" className={`h-3.5 w-3.5 ${star < review.rating ? "fill-current" : "fill-none stroke-current"}`} strokeWidth={1.5}>
                  <path d="m12 3 2.8 5.7 6.3.9-4.55 4.43L17.63 21 12 18l-5.63 3 1.08-6.97L2.9 9.6l6.3-.9L12 3Z" />
                </svg>
              ))}
            </div>

            <blockquote lang="ms" className="my-3 flex-1 text-sm leading-6 text-cocoa-800">
              <p>&ldquo;{review.comment}&rdquo;</p>
            </blockquote>

            <div className="flex items-center gap-2.5 border-t border-cocoa-900/8 pt-3">
              <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream-100 font-display text-xs font-semibold text-brand-800">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-xs font-semibold text-cocoa-900">{review.customer}</p>
                <p className="mt-0.5 text-[0.6875rem] text-cocoa-500">{review.source} customer review</p>
              </div>
            </div>

            <ReviewScreenshotDialog customer={review.customer} screenshot={review.screenshot} />
          </article>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p aria-live="polite" aria-atomic="true" className="text-xs text-cocoa-500">
          Reviews {position.first + 1}–{Math.min(position.first + position.visible, reviews.length)} of {reviews.length}
        </p>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous reviews" aria-controls={railId} disabled={position.first === 0} onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-brand-700/20 bg-white text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-35 sm:h-9 sm:w-9">
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
          </button>
          <button type="button" aria-label="Next reviews" aria-controls={railId} disabled={position.first + position.visible >= reviews.length} onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-full border border-brand-700/20 bg-white text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-35 sm:h-9 sm:w-9">
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
