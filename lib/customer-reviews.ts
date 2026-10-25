export type ReviewScreenshot = {
  /** Place the owner's screenshot in public/reviews/ and use /reviews/filename. */
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
  isSample: boolean;
  screenshot: ReviewScreenshot | null;
};

// Layout samples only. Replace with owner-provided reviews and screenshots.
// Set isSample to false only after the real review has been supplied.
export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "sample-everyday-meals",
    customer: "Sample customer 01",
    rating: 5,
    comment: "A little extra flavour for everyday meals. This is sample review text for the layout preview.",
    source: "Shopee",
    isSample: true,
    screenshot: null,
  },
  {
    id: "sample-family-table",
    customer: "Sample customer 02",
    rating: 5,
    comment: "Something lovely to share around the table. This is sample review text, not actual customer feedback.",
    source: "Shopee",
    isSample: true,
    screenshot: null,
  },
  {
    id: "sample-pantry-favourite",
    customer: "Sample customer 03",
    rating: 4,
    comment: "An everyday pantry favourite. This placeholder will be replaced with a real customer review.",
    source: "Shopee",
    isSample: true,
    screenshot: null,
  },
];
