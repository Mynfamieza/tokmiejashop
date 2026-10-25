# Manual DuitNow QR change summary

Customers now confirm and save the order before seeing the owner's original QR
and the server-calculated payable total. `pay_now` remains the database value;
QR orders stay `unpaid` until the owner checks the receiving account and saves
the payment status. Existing design tokens, product data, cart behavior,
delivery rules, COD eligibility, order controls and historical payments remain.

| Files | Change |
| --- | --- |
| `app/checkout/actions.ts` | Calls only Supabase order creation; no gateway call, bill URL or payer email requirement. |
| `app/checkout/checkout-flow.tsx` | Defaults to QR, switches ineligible COD to QR, saves confirmation before clearing the cart, and navigates locally after success. |
| `components/checkout/payment-method-select.tsx` | Manual DuitNow QR label/instructions; eligible Kulim COD remains selectable. |
| `components/checkout/review-order.tsx` | Confirm Order wording and explanation that QR payment follows order creation. |
| `components/checkout/duitnow-payment.tsx` (new) | Responsive cream/maroon QR section, exact MYR total, reference, Malay instructions, pending message and original JPEG download. |
| `components/checkout/order-confirmation-view.tsx` | Shows QR instructions for outstanding QR orders and links to tracking for current status or missing session details. |
| `lib/checkout.ts` | In-memory confirmation fallback for blocked sessionStorage; validates the requested order number against the saved confirmation. |
| `lib/delivery.ts` | Updates method label and adds shared payment-status validation/pending-payment helpers. Delivery amounts are unchanged. |
| `components/checkout/order-summary.tsx`, `components/cart/cart-drawer.tsx`, `components/product-detail.tsx` | Replace Pay Now delivery wording with DuitNow QR; preserve layout and prices. |
| `lib/orders.ts` | Loads method, payment status and historical bill code for dashboard lists. |
| `components/dashboard/orders-list.tsx` | Identifies pending QR payments and shows payment method/status, retaining a historical gateway label. |
| `components/dashboard/order-detail.tsx` | Keeps historical bill/reference/transaction details and adds owner payment controls. |
| `components/dashboard/payment-status-control.tsx` (new) | Explicit manual owner status selection and save, with verification instructions and error feedback. |
| `app/dashboard/orders/actions.ts` | Adds owner-authorized payment-status updates with existing RLS, timestamp preservation and a concurrent-update check. Existing order/courier actions remain. |
| `public/duitnow-qr.jpg` (new) | Byte-for-byte copy of the supplied owner image. SHA-256: `ED272DF2797DCDE245FED9E4EA156FDA2067F5C6CB76694DCF27968A2039EAB7`. |
| `app/privacy/page.tsx` | Describes payment through the customer's bank/e-wallet and manual owner checks. |
| `.env.example`, ignored `.env.local` | Removes obsolete ToyyibPay configuration. No credential values are recorded here. |
| `README.md` | Documents current payment flow, fees, owner verification and migration instructions. |
| `supabase/phase13_manual_duitnow.sql` (new) | Idempotently revokes legacy callback RPC execution from public, anon and authenticated. Does not delete functions, records, columns or history. |
| `vercel.json` (new) | Disables automatic Vercel Git deployments for `feat/manual-duitnow-payment` only, so pushing this review branch does not deploy it. |
| `tests/manual-duitnow.test.mjs` (new) | Eleven isolated action/component/checkout regression checks with mocked database dependencies. |
| `docs/manual-duitnow-testing.md` (new) | Exact manual upgrade, checkout, mobile download, failure, COD, owner and historical-record test steps. |
| `docs/manual-duitnow-changes.md` (new) | This file summary and verification record. |
| `lib/toyyibpay.ts`, `app/api/webhooks/toyyibpay/route.ts`, `app/payment/toyyibpay/return/page.tsx` (removed) | Retires the unused gateway client, webhook route and return page; these deletions were already present in the starting working tree. |

The starting tree had deleted `supabase/phase7b_toyyibpay.sql` and removed
historical fields from `lib/types.ts`/the dashboard. The migration and field
types are restored to their committed contents, and historical references are
visible again. No historical migration or payment record is deleted.

Unrelated existing changes in `lib/supabase/client.ts`,
`lib/supabase/config.ts`, `package-lock.json` and `app/auth/` were left intact.

## Verification performed

- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed. The sandboxed attempt could not fetch the existing
  Google Fonts; the network-enabled retry succeeded without font/design changes.
- `node --test --test-isolation=none tests/manual-duitnow.test.mjs`: 11 passed.
- `git diff --check`: passed.
- Local browser review of the actual confirmation components with sample order
  data at 375px and 1280px viewport settings: QR loaded, pending copy visible,
  correct sample total/reference, no horizontal overflow, download link present.
  The fixture had no database connection and was stopped afterward.

The Supabase migration was not executed, and live order creation/payment updates
were not exercised against production. Use the separate test-project checklist
in `manual-duitnow-testing.md` before rollout. No deployment was performed.
