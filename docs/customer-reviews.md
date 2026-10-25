# Shopee customer reviews

Review content lives in `lib/customer-reviews.ts`; no database is used. The five
cards contain short, exact excerpts from owner-provided Malay review screenshots.
All five ratings are 5/5. Customer labels are anonymous (`Customer 01`–`05`).
Do not translate, correct the spelling of, or embellish customer comments.

Only privacy-redacted screenshots belong in `public/reviews/`. Never put the
unredacted source files, usernames or profile photos in the repository or public
assets. Redact the username and avatar in the image itself, not with CSS overlays,
and strip metadata. Preserve all review text, stars and product pictures.

Each `screenshot` entry must reference its matching redacted PNG and actual image
dimensions. **View Original** opens that screenshot in the existing modal, with
a visible privacy-redaction notice. Close with its button, Escape or the backdrop.

The carousel shows three cards on desktop and one on mobile. Previous/Next move
one review at a time; touch/trackpad scrolling is supported. The range indicator
shows the currently visible reviews, and navigation stops at either end. Reduced
motion preferences are respected. There is no automatic scrolling.

Verify all five matching screenshots, navigation at both ends, phone/desktop
layout, popup close/focus behavior, and the privacy masks before publishing.
Checkout, COD, QR payment, delivery fees, orders and schema are outside this change.
