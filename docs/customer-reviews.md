# Homepage customer reviews

Edit `lib/customer-reviews.ts` to update cards. No database or admin UI is used.
Every initial card, rating and attribution is explicitly labeled as sample
content. No genuine customer review or original Shopee screenshot is supplied.

For an owner-provided review, replace the comment, rating and display name with
the approved content. Put the original screenshot in `public/reviews/`, then
set `screenshot` to `{ src: "/reviews/filename.jpg", alt: "Original Shopee review
screenshot", width: 800, height: 1200 }`, using its actual dimensions. Set
`isSample: false` only for genuine, owner-provided feedback. Check screenshots
for personal information before making them public.

**View Original** opens a native modal. Without a screenshot, it clearly shows
that none has been provided. With a screenshot, it displays the original image.
Close using the close button, Escape, or the backdrop. The native dialog handles
focus trapping and returns focus to the triggering button.

Only the homepage About block is removed. Navigation is untouched. In this
checkout there is no standalone About route: the existing About link remains
`/#about`, whose former homepage target has been removed as requested.

Review at phone and desktop widths: check the sample notices, card layout,
popup open/close behavior, keyboard focus, and no horizontal overflow. Checkout,
COD, QR payment, delivery fees and order management are outside this change.
