# Manual DuitNow QR testing

Use a separate test Supabase project. Do not create test orders or apply SQL
against production. No deployment or migration is run automatically.

1. Apply existing migrations to the test project. Apply
   `supabase/phase13_manual_duitnow.sql` last, twice, to check idempotency.
   Confirm historical order/payment data is unchanged and the legacy callback
   is no longer executable by public, anon or authenticated callers.
2. Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, and
   `node --test --test-isolation=none tests/manual-duitnow.test.mjs`.
3. Start the app, add a product, and open checkout. Choose
   **DuitNow QR (Manual Payment)**. Enter customer details without email.
   Review and confirm the order. Confirm no ToyyibPay request or redirect occurs.
4. On the confirmation page, compare the exact total and order reference with
   the saved order. Confirm the original QR, Malay amount-entry instructions,
   Download QR button and **Menunggu Pengesahan Bayaran** message appear.
   Refresh in the same browser session and confirm the saved details persist.
5. Download the QR and confirm it matches the supplied JPEG. Check phone and
   desktop layouts. Do not send a real payment. Confirm the new order remains
   `payment_method = 'pay_now'` and `payment_status = 'unpaid'` after viewing,
   refreshing or downloading. Payment remains subject to the owner's existing
   manual verification process; no dashboard controls are added by this change.
6. Confirm original COD behavior: only Kulim addresses qualify; 1–4 jars cost
   RM2 delivery for COD or RM6 for QR; 5+ jars receive free delivery. COD
   confirmation retains handover instructions and does not request QR payment.
7. Trigger an insufficient-stock failure using test data. Confirm the cart
   stays intact. Retry and confirm idempotency prevents a duplicate order.
8. Open existing dashboard orders. Confirm order-status and courier controls,
   order lists, and historical ToyyibPay references/timestamps retain their
   original behavior. The payment-method text is the only dashboard change:
   historical bills retain a ToyyibPay label; manual orders show DuitNow QR.
