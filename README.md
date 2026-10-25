# TokMieja Shop

A cheerful, modern Malaysian F&B online store for **TokMieja** products.
Built mobile-first, with a warm maroon / cream / mango design system.

> **Phase 1 (this repository state) is the project foundation only.**
> It includes the design system, the public shell (homepage + products list),
> the owner login page, the Supabase connection and the database schema.
> Cart, checkout, payments, orders UI, owner dashboard and notifications are
> intentionally **not** included yet.

---

## 1. Purpose

TokMieja Shop is a friendly online storefront for TokMieja's food products
(sambal and cookies). The goal is a "food app that makes you hungry" feel:
appetising, playful and easy to use on a phone.

---

## 2. Tech stack

- **Next.js** (App Router) with **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** for Postgres database + Auth
- **Git / GitHub** for version control

---

## 3. Project structure

```
app/                 App Router routes and global styles
  page.tsx           Homepage shell
  products/page.tsx  Public product list (reads from Supabase)
  login/page.tsx     Owner login
  layout.tsx         Root layout (fonts, metadata)
  globals.css        Design tokens + base styles
components/          Reusable UI (design system + storefront pieces)
  ui/                Button, Card, Badge, Input, SectionHeading
lib/                 Helpers, types and data access
  supabase/          Supabase browser + server clients, env config
  catalog.ts         Product / category queries
  preview-data.ts    Bundled sample catalog (preview mode only)
supabase/            SQL to run in your Supabase project
  schema.sql         Tables, indexes, triggers, RLS
  seed.sql           TokMieja sample products + categories
public/              Static assets
```

---

## 4. Installation

Requires **Node.js 20.9+**.

```bash
npm install
```

---

## 5. Environment variables

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

   (On Windows PowerShell: `Copy-Item .env.example .env.local`.)

2. Open `.env.local` and fill in the two values from your own Supabase project
   (**Project Settings → API**):

   | Variable | Where to find it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API key, `anon` / `public` |

> **Security:** only the **anon (public)** key is used here. Never put a
> `service_role` key in `NEXT_PUBLIC_*` variables or in the repo.
> `.env.local` is ignored by Git; `.env.example` is safe to commit.

If the two variables are missing, the storefront still runs in **preview mode**
and shows a small sample catalog with a clear notice. Configure them to load
real data.

---

## 6. Supabase setup (manual)

You must run the SQL yourself in the Supabase SQL Editor.

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor → New query**.
3. Paste the entire contents of `supabase/schema.sql` and click **Run**.
   This creates the tables, indexes, triggers and Row Level Security policies.
4. Open a new query, paste the entire contents of `supabase/seed.sql` and
   click **Run**. This inserts the sample categories and products.
5. Open a new query, paste the entire contents of
   `supabase/phase3_order_creation.sql` and click **Run**. This adds the secure
   `create_order` database function used by checkout (see section 12).
6. Create the owner account: go to **Authentication → Users → Add user** and
   create an email + password user. This account logs in at `/login`.
7. Open a new query, paste `supabase/phase4_owner_management.sql` and click
   **Run**. Then grant that account owner access (replace the email):

   ```sql
   insert into public.owners (user_id)
   select id from auth.users where email = 'YOUR_OWNER_EMAIL'
   on conflict (user_id) do nothing;
   ```

   Without this row the account can sign in but cannot access `/dashboard`.
8. Open a new query, paste `supabase/phase5_1_product_images.sql` and click
   **Run**. This creates the public `product-images` Storage bucket and the
   owner-only upload/replace/delete policies (see section 15).
9. Open a new query, paste `supabase/phase6_delivery_payment.sql` and click
   **Run**. This adds delivery/payment fields and updates the secure
   `create_order` function (see section 16).

### Verify the data

Run this in the SQL Editor:

```sql
select name, price, category, active, featured
from public.products
order by created_at;
```

---

## 7. Local development

```bash
npm run dev
```

Open <http://localhost:3000>.

Useful commands:

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
npx tsc --noEmit # TypeScript check
```

---

## 8. Manual testing checklist

| Route | What to check |
| --- | --- |
| `/` | Hero, category preview, featured products, footer, mobile menu. |
| `/products` | Active products load; category filter chips work. |
| `/products/[slug]` | Product detail, quantity selector, add to cart. |
| `/checkout` | Customer form, order review, confirm order. |
| `/order-confirmation/[orderNumber]` | Confirmation for the order you just placed. |
| `/dashboard/products` | Owner: list/add/edit products, activate/deactivate. |
| `/dashboard/categories` | Owner: list/add/edit categories, activate/deactivate. |
| `/login` | Validation, loading state and error state work. |

---

## 9. Database overview

| Table | Purpose |
| --- | --- |
| `categories` | Storefront categories (`sambal`, `cookies`, …). |
| `products` | Sellable products, linked to `categories.slug`. |
| `orders` | Customer orders with status + totals. |
| `order_items` | Line items; name/price are snapshotted for history. |

Order statuses: `pending`, `confirmed`, `preparing`, `shipped`, `completed`,
`cancelled`.

**Security model**

- **Public (anon):** read **active** products and categories only.
- **Owner (allowlisted):** full access to products, categories and orders.
  "Authenticated" alone is not enough — see `public.owners` / `is_owner()`
  in section 13.
- **Orders:** there is deliberately **no public insert policy**. Customers can
  only create orders through the validated `create_order` database function
  (see section 12); direct inserts/reads of orders remain blocked by RLS.

---

## 10. Git safety notes

- `.env.local` (and all `.env*` files except `.env.example`) is ignored.
- Never commit real keys, tokens or customer data.
- Product images can be hosted on Supabase Storage. If you host them
  elsewhere, add the host to `images.remotePatterns` in `next.config.ts`.

---

## 11. Roadmap

- **Phase 1:** project foundation, design system, database, public shell, login.
- **Phase 2:** product detail, cart, localStorage persistence. ✅
- **Phase 3:** checkout, review, order creation, order confirmation. ✅
- **Phase 4:** owner auth, dashboard, orders list, order detail, status updates. ✅
- **Phase 5:** owner product & category management. ✅
- **Phase 5.1:** product image upload to Supabase Storage. ✅
- **Phase 6:** delivery fee, free delivery & payment method foundation. ✅
- **Payment:** manual DuitNow QR (`pay_now`) and Kulim-only COD.
- **Later:** refunds, WhatsApp, notifications, analytics, PWA.

---

## 12. Checkout & secure order creation (Phase 3)

The customer flow is: Product → Add to cart → Cart → `/checkout` →
Details → Review → Confirm → `/order-confirmation/[orderNumber]`.

Trust is never placed in the browser. `app/checkout/actions.ts` (a Server
Action) calls the `public.create_order(...)` database function defined in
`supabase/phase3_order_creation.sql`. That function:

- re-reads every product from the database and rejects missing/inactive items,
- checks stock and **locks** the product row to prevent overselling,
- uses the **database price** to compute each line and the totals,
- writes `orders` + `order_items` (snapshotting `product_name` / `unit_price`),
- decrements stock and creates the order atomically,
- generates the order number server-side as `TM-YYYYMMDD-XXX`,
- starts new orders with status `pending`.

Duplicate submissions are prevented by disabling the Confirm button while
submitting plus an `orders.idempotency_key` unique index: a repeated submission
returns the existing order instead of creating a second one.

The later Phase 6 and Phase 10.2 migrations calculate delivery on the server:
RM6 for QR or RM2 for eligible COD on 1–4 jars; free for 5+ jars.

Order confirmation details are kept in `sessionStorage` (survives refresh);
there is no public read access to the `orders` table, so one customer can never
read another customer's order.

---

## 13. Owner dashboard (Phase 4)

The owner flow is: `/login` → `/dashboard` (Overview) → `/dashboard/orders`
→ `/dashboard/orders/[orderNumber]` → update status.

**Authentication.** Supabase Auth, reusing the existing `/login` page. A root
`proxy.ts` refreshes the session cookie and redirects signed-out visitors from
`/dashboard/*` to `/login`. Every dashboard page and server action additionally
verifies the session server-side.

**Owner authorization.** Being signed in is not enough. Only users listed in
`public.owners` may manage data. The `public.is_owner()` function backs the RLS
policies on `orders`, `order_items`, `products` and `categories`, and the
dashboard/server actions call it before doing anything. Public customers are
unaffected: they still read active products/categories and create orders only
through the `create_order` RPC.

**Status updates** use the existing `order_status` enum
(`pending → confirmed → preparing → shipped → completed`, plus `cancelled`) and
are validated and authorized in the server action, with RLS as the second line
of defence.

Historical order lines are read from `order_items` (purchase-time
`product_name` / `unit_price`); the dashboard never re-prices old orders from
the current `products` table.

---

## 14. Owner product & category management (Phase 5)

Routes: `/dashboard/products` (+ `/new`, `/[id]/edit`) and
`/dashboard/categories` (+ `/new`, `/[id]/edit`).

- Full CRUD-style management on the existing `products` and `categories`
  tables — no schema changes and **no new migration** are required.
- Only owners (`public.is_owner()`) can write. Every server action re-checks the
  owner context before touching the database, and RLS is the second line of
  defence. There is no `USING (true)` policy.
- Product slugs are generated safely from the name (lowercased, `a-z0-9-`) and
  kept unique by appending `-2`, `-3`, …; the slug is **preserved on edit** so
  existing URLs keep working. Duplicate names/slugs surface a friendly error.
- Products and categories are deactivated rather than hard-deleted, so
  historical `order_items` snapshots and product URLs stay intact.
- **Storefront behaviour:** public visibility now follows the database
  `active` flags. Active products in active categories appear; inactive
  products/categories are hidden. `create_order` remains the only way orders
  are priced and created (the browser is never trusted for price or stock).
- Product images are uploaded to the `product-images` Storage bucket (see
  section 15); `products.image_url` remains the source of truth.

---

## 15. Product image upload (Phase 5.1)

Owners upload images directly from the product form instead of pasting URLs.

- **Storage bucket:** `product-images` (public read, owner-only write). Created
  by `supabase/phase5_1_product_images.sql`.
- **Storage policies:** anyone may SELECT (view), but INSERT/UPDATE/DELETE
  require `public.is_owner()`. No `USING (true)` policy.
- **Bucket restrictions:** Storage enforces `allowed_mime_types`
  (`image/jpeg`, `image/png`, `image/webp`) and a 5 MB `file_size_limit`.
- **Validation:** the browser checks type/size for UX, and the server action
  re-checks size and sniffs the file's magic bytes (JPEG/PNG/WebP) — the
  filename and declared MIME type are never trusted.
- **Flow:** choose image → local preview (no upload yet) → on submit, upload to
  `products/{productId}/{uuid}.{ext}` (or `products/temp/...` for new
  products) → save the public URL to `products.image_url` → revalidate.
- **Replace:** the new image is stored and saved first; the old file is deleted
  afterwards. **Remove:** `image_url` is cleared and the owned file is deleted.
- **Cleanup:** if saving the product fails after an upload, the just-uploaded
  file is removed (best effort).
- Server Actions accept up to `6mb` (`experimental.serverActions.bodySizeLimit`
  in `next.config.ts`) to allow a 5 MB image plus multipart overhead.

---

## 16. Delivery, free delivery & payment foundation (Phase 6)

Business rules (all recalculated **server-side** in `create_order`; the client
is never trusted for fees, totals, eligibility or payment status):

- **Standard delivery:** RM6 for QR; RM2 for COD (Phase 10.2), no minimum order.
- **Free delivery:** when the total product **quantity** across the order is
  **5 jars/bottles or more** (quantity based, not subtotal based).
- **Payment method:** `pay_now` or `cod` (COD / Pay by Hand).
- **COD eligibility:** Kulim addresses only, checked server-side.
- **Payment status:** `pay_now` → `unpaid`; `cod` → `pending`. Nothing is marked
  `paid` until the owner manually verifies and saves the payment status.
- **Location pin:** optional Google Maps link, validated as `http(s)://`.

Database (`supabase/phase6_delivery_payment.sql`):

- `orders.delivery_fee` already existed; adds `payment_method`,
  `payment_status`, `location_pin` with CHECK constraints.
- `public.is_kulim_address(text)` — isolated, conservative check requiring the
  explicit word "kulim" (ambiguous addresses are not treated as Kulim).
- Replaced `public.create_order(...)` with a new signature that receives
  `p_payment_method` and `p_location_pin`, re-reads products/prices, sums
  quantity, computes the delivery fee and total, validates payment eligibility,
  and sets payment status. Stock locking/decrement, idempotency and order-item
  snapshots are unchanged.
- RLS is unchanged; the browser never sends a fee or total, and no
  service-role key is used.

UI: checkout collects the location pin and payment method, shows
Subtotal/Delivery (FREE when applicable)/Total, and the review step shows the
delivery + payment choice. The customer confirmation and the owner order detail
display the payment method/status and delivery details.

## 17. Manual DuitNow QR payments

Checkout uses the owner's unchanged QR at `public/duitnow-qr.jpg`. The image is
copied directly from the supplied JPEG, without generating or re-encoding a QR.
`pay_now` remains the database value for compatibility. Email is optional.

Details → Review (including delivery and total) → Confirm Order → Supabase
`create_order` → confirmation with the exact saved total, order reference,
Malay payment instructions and Download QR. Customers enter the amount in
their bank/e-wallet app themselves. QR orders start `unpaid`; downloading or
scanning the image does not update payment status. Failed order creation keeps
the cart. Confirmation survives refresh in the same browser session, with an
in-memory fallback if sessionStorage is blocked. Track order provides current
payment status using the order number and checkout phone number.

The owner checks the receiving bank/e-wallet account, matches the amount and
reference, then uses **Payment status → Paid → Save payment status** in the
order detail. Only an authenticated, allowlisted owner can save; existing RLS
remains enforced. Order status, courier, stock and totals are not changed by
payment verification. Historical ToyyibPay references and timestamps remain
visible in the owner detail.

### Database change (manual; not applied by this code change)

Run `supabase/phase13_manual_duitnow.sql` after existing migrations in a test
Supabase project first. It safely revokes public/anon/authenticated execution
of the old ToyyibPay callback RPC if it exists. It preserves the function,
payment records, columns and historical migrations, and changes no order data.
Do not re-run `phase7b_toyyibpay.sql` afterward, because it re-grants callback
access. The active checkout no longer calls any ToyyibPay API, return page or
webhook. The existing `create_order` from `phase10_2_cod_delivery_fee.sql`
already accepts `pay_now`, allows null email and sets QR payments to `unpaid`;
no replacement of that function is needed.

Remove obsolete `TOYYIBPAY_*` variables from any future deployment environment
when rolling this change out. The example and local environment no longer
contain them. No service-role key is required. Keep `NEXT_PUBLIC_APP_URL` since
metadata still uses it. Do not run seed SQL against an existing live store.

See [the manual test checklist](docs/manual-duitnow-testing.md) for exact test
steps. This change does not deploy the site or apply SQL automatically.
