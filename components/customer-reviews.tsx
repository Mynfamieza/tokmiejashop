import { CustomerReviewsCarousel } from "@/components/customer-reviews-carousel";
import { CUSTOMER_REVIEWS } from "@/lib/customer-reviews";

export function CustomerReviews() {
  if (CUSTOMER_REVIEWS.length === 0) return null;

  return (
    <section aria-labelledby="customer-reviews-heading" className="container-page pt-10 sm:pt-12">
      <div className="rounded-panel border border-cocoa-900/10 bg-cream-100 p-4 sm:p-5 lg:p-6">
        <div className="max-w-2xl">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
            Customer reviews
          </p>
          <h2 id="customer-reviews-heading" className="mt-2 text-balance font-display text-2xl font-semibold leading-tight text-cocoa-900 sm:text-3xl">
            Tried, Tasted &amp; Loved.
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-cocoa-600 sm:text-sm">
            Real reviews from our Shopee customers.
          </p>
        </div>

        <CustomerReviewsCarousel reviews={CUSTOMER_REVIEWS} />
      </div>
    </section>
  );
}
