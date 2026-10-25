# Manual DuitNow QR verification

Use a separate test Supabase project with test products and an allowlisted
owner. Do not run these writes or change stock in production. Configure only
that project's public URL/anon key in the test environment.

1. Apply existing migrations, including `phase10_2_cod_delivery_fee.sql`,
   `phase9_order_tracking.sql` and `phase12_courier_tracking.sql`. For an upgrade,
   leave the already-applied ToyyibPay migration and historical data in place.
   Apply `phase13_manual_duitnow.sql` last, twice, to confirm it is idempotent.
   Confirm existing order counts, payment statuses, gateway references and paid
   timestamps are unchanged. Do not re-run phase7b after phase13.
2. Run `npm run lint`, `npx tsc --noEmit` and `npm run build`. Start locally with
   `npm run dev`. Open `/products` and add 1 jar of a product with enough stock.
   The isolated regression suite can also be run without Supabase access:
   `node --test --test-isolation=none tests/manual-duitnow.test.mjs`.
3. Open checkout. Confirm **DuitNow QR (Manual Payment)** is selected. Enter a
   full name, a valid phone and a non-Kulim delivery address; leave email blank.
   Confirm COD is disabled. Continue to review: delivery must be RM6 and total
   must equal the product subtotal plus RM6. Confirm the QR instructions explain
   that payment follows order creation.
4. In browser Network tools, click **Confirm Order** once. Confirm the order is
   created through the checkout Server Action, the browser stays on this shop,
   and there are no ToyyibPay requests, redirects or callback dependencies.
   Confirm the cart clears only after successful creation.
5. On `/order-confirmation/[orderNumber]`, check the owner QR image, exact order
   reference and total against the saved Supabase order. Confirm the Malay
   instructions say to enter the amount manually and the section says
   **Menunggu Pengesahan Bayaran**, with no payment success claim. Refresh the
   page in the same tab and confirm the details remain available.
6. At 375px width and desktop width, check QR visibility, readable instructions,
   no horizontal overflow and usable buttons. Click **Download QR / Muat turun
   QR**. Confirm the downloaded JPEG is the supplied image. On a phone, confirm
   the bank/e-wallet app can import it from the gallery if supported. Check the
   receiver name matches the owner; cancel before sending a real payment.
7. In test Supabase, confirm the order has `payment_method = 'pay_now'`,
   `payment_status = 'unpaid'`, `status = 'pending'` and no new gateway reference.
   Downloading QR, refreshing and viewing the order must leave it unpaid.
8. Sign in as the test owner. In dashboard orders and recent orders, confirm
   the payment method/status and **Menunggu Pengesahan Bayaran** are visible.
   Open the order. After simulating an externally verified test payment, select
   **Paid** and click **Save payment status**. Reload: payment must remain paid,
   a paid timestamp must appear, and order status, totals, items, stock and any
   historical gateway references must remain unchanged. Verify the existing
   order-status and courier controls still work independently.
9. Use `/track-order` with that order number and checkout phone: status must now
   be Paid. A wrong phone must return no order details. The confirmation page
   labels its session snapshot and links to tracking for current payment status.
   A new tab without that session must provide a tracking link without exposing
   order details based only on the order number.
10. Sign out and verify dashboard access is blocked. An authenticated user who
    is not allowlisted must also be unable to update payment status. In test
    Supabase, verify `anon` and `authenticated` cannot execute the retired
    callback RPC after phase13.
11. Check COD: enter an address containing the word **Kulim**, select COD, and
    review 1–4 jars: delivery RM2. Confirm the order: payment status remains
    `pending`, and confirmation shows handover instructions with no QR payment
    request. Change a COD-selected address to a non-Kulim address before review:
    the selection must switch to QR and delivery to RM6. Server-side submission
    of COD for a non-Kulim address must be rejected.
12. Check 5 jars with both QR and eligible COD: delivery FREE, exact saved total
    equals subtotal. Also check 4 jars retains the corresponding RM6/RM2 fee.
13. Check failures using only test data: add a product, then deactivate it or
    lower its stock below the cart quantity before confirming. Confirm a useful
    error appears and the cart remains intact. Re-enable/restock and retry;
    confirm one order and one stock decrement. Repeat with a failed network
    response and retry using the same checkout: the idempotency key must avoid
    duplicate orders if the first request reached the database.
14. Inspect a historical ToyyibPay order in the test copy. Confirm bill code,
    reference number, transaction ID, paid timestamp, order items and existing
    payment status remain visible and unchanged.

Payment verification is manual. Do not use a real transfer or production data
for this checklist. No deployment or SQL execution is performed automatically.
