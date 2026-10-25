export type ReviewScreenshot = {
  /** Only privacy-redacted screenshots may be placed in public/reviews/. */
  src: `/reviews/${string}`;
  alt: string;
  width: number;
  height: number;
};

export type CustomerReview = {
  id: string;
  customer: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  source: "Shopee";
  screenshot: ReviewScreenshot;
};

// Exact, short excerpts from the five owner-supplied Shopee screenshots.
// Preserve the original wording; never put usernames or raw screenshots here.
export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "shopee-01",
    customer: "Customer 01",
    rating: 5,
    comment: "nak repeat lagi ni.",
    source: "Shopee",
    screenshot: {
      src: "/reviews/shopee-review-01.png",
      alt: "Five-star Shopee review for Customer 01; username and profile photo hidden",
      width: 1170,
      height: 558,
    },
  },
  {
    id: "shopee-02",
    customer: "Customer 02",
    rating: 5,
    comment: "Hari ni order. Esok post terus gaiss.",
    source: "Shopee",
    screenshot: {
      src: "/reviews/shopee-review-02.png",
      alt: "Five-star Shopee review for Customer 02; username and profile photo hidden",
      width: 1170,
      height: 817,
    },
  },
  {
    id: "shopee-03",
    customer: "Customer 03",
    rating: 5,
    comment: "Anak laki darjah 3 suka sangat sambal ni.",
    source: "Shopee",
    screenshot: {
      src: "/reviews/shopee-review-03.png",
      alt: "Five-star Shopee review for Customer 03; username and profile photo hidden",
      width: 1170,
      height: 955,
    },
  },
  {
    id: "shopee-04",
    customer: "Customer 04",
    rating: 5,
    comment: "crunchy dan sgt² sedap",
    source: "Shopee",
    screenshot: {
      src: "/reviews/shopee-review-04.png",
      alt: "Five-star Shopee review for Customer 04; username and profile photo hidden",
      width: 1170,
      height: 568,
    },
  },
  {
    id: "shopee-05",
    customer: "Customer 05",
    rating: 5,
    comment: "sedap nak mampuii",
    source: "Shopee",
    screenshot: {
      src: "/reviews/shopee-review-05.png",
      alt: "Five-star Shopee review for Customer 05; username and profile photo hidden",
      width: 1170,
      height: 680,
    },
  },
];
