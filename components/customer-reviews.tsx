import { ReviewScreenshotDialog } from "@/components/review-screenshot-dialog";
import { CUSTOMER_REVIEWS } from "@/lib/customer-reviews";

export function CustomerReviews() {
  if (CUSTOMER_REVIEWS.length === 0) return null;

  const hasSamples = CUSTOMER_REVIEWS.some((review) => review.isSample);

  return (
    <section aria-labelledby="customer-reviews-heading" className="container-page pt-16 sm:pt-20">
      <div className="rounded-panel border border-cocoa-900/10 bg-cream-100 p-5 sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Customer reviews
          </p>
          <h2 id="customer-reviews-heading" className="mt-3 text-balance font-display text-3xl font-semibold leading-tight text-cocoa-900 sm:text-4xl">
            Loved by Our Customers
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-cocoa-600 sm:text-base">
            Good food, shared moments, and stories from your table.
          </p>
        </div>

        {hasSamples ? (
          <p className="mt-5 rounded-xl border border-brand-700/10 bg-white/70 px-4 py-3 text-sm leading-relaxed text-cocoa-700">
            <strong className="font-semibold text-brand-800">Sample preview only.</strong>{" "}
            Cards marked Sample are placeholders, not genuine customer reviews.
            Original Shopee feedback will be added when available.
          </p>
        ) : null}

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {CUSTOMER_REVIEWS.map((review, index) => (
            <article key={review.id} className="flex flex-col rounded-card border border-cocoa-900/10 bg-white p-6 shadow-soft sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="img" aria-label={`${review.isSample ? "Sample rating: " : ""}${review.rating} out of 5 stars`} className="flex gap-1 text-mango-500">
                  {Array.from({ length: 5 }, (_, star) => (
                    <svg key={star} viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 ${star < review.rating ? "fill-current" : "fill-none stroke-current"}`} strokeWidth={1.5}>
                      <path d="m12 3 2.8 5.7 6.3.9-4.55 4.43L17.63 21 12 18l-5.63 3 1.08-6.97L2.9 9.6l6.3-.9L12 3Z" />
                    </svg>
                  ))}
                </div>
                {review.isSample ? (
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-brand-700">
                    Sample review
                  </span>
                ) : null}
              </div>

              <blockquote className="mb-7 mt-5 flex-1 text-base leading-relaxed text-cocoa-800">
                <p>&ldquo;{review.comment}&rdquo;</p>
              </blockquote>

              <div className="flex items-center gap-3 border-t border-cocoa-900/8 pt-5">
                <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-100 font-display text-sm font-semibold text-brand-800">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-cocoa-900">{review.customer}</p>
                  <p className="mt-0.5 text-xs text-cocoa-500">
                    {review.source} {review.isSample ? "· sample attribution" : "customer review"}
                  </p>
                </div>
              </div>

              <ReviewScreenshotDialog
                customer={review.customer}
                isSample={review.isSample}
                screenshot={review.screenshot}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
