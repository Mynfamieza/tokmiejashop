-- ============================================================================
-- TokMieja Shop - database schema (Phase 1)
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   (Or use the Supabase CLI: `supabase db execute --file supabase/schema.sql`.)
--
-- The script is written to be safe to re-run.
--
-- SCOPE (Phase 1): products, categories, orders, order items + RLS.
-- No order-creation workflow is included yet. It will be added later through a
-- secure server-side / RPC path with validation (never a public insert policy).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Shared helper: keep `updated_at` current on every UPDATE
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_name_not_blank check (length(btrim(name)) > 0),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

comment on table public.categories is
  'Product categories shown in the storefront (e.g. Sambal, Cookies).';

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null default 0,
  image_url text,
  category text not null,
  active boolean not null default true,
  featured boolean not null default false,
  stock_quantity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_price_non_negative check (price >= 0),
  constraint products_stock_non_negative check (stock_quantity >= 0),
  constraint products_name_not_blank check (length(btrim(name)) > 0),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_category_fkey foreign key (category)
    references public.categories (slug)
    on update cascade
    on delete restrict
);

comment on table public.products is
  'Sellable products. `category` stores the related categories.slug.';
comment on column public.products.image_url is
  'Public image URL. NULL renders a branded placeholder in the UI.';

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'order_status'
  ) then
    create type public.order_status as enum (
      'pending',
      'confirmed',
      'preparing',
      'shipped',
      'completed',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text,
  notes text,
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_subtotal_non_negative check (subtotal >= 0),
  constraint orders_delivery_fee_non_negative check (delivery_fee >= 0),
  constraint orders_total_non_negative check (total >= 0),
  constraint orders_customer_name_not_blank check (length(btrim(customer_name)) > 0),
  constraint orders_customer_phone_not_blank check (length(btrim(customer_phone)) > 0)
);

comment on table public.orders is
  'Customer orders. Writes will go through a validated server-side workflow in a later phase.';

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
-- product_name and unit_price are copied at purchase time so historical orders
-- never change when a product is edited or removed later.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null
    references public.orders (id) on delete cascade,
  product_id uuid
    references public.products (id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null,
  subtotal numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_unit_price_non_negative check (unit_price >= 0),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_subtotal_non_negative check (subtotal >= 0),
  constraint order_items_product_name_not_blank check (length(btrim(product_name)) > 0)
);

comment on table public.order_items is
  'Order line items. Product name and price are snapshotted for history.';

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists categories_active_sort_idx
  on public.categories (active, sort_order);

create index if not exists products_active_idx
  on public.products (active);
create index if not exists products_featured_idx
  on public.products (featured) where featured;
create index if not exists products_category_idx
  on public.products (category);

create index if not exists orders_status_idx
  on public.orders (status);
create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);
create index if not exists order_items_product_id_idx
  on public.order_items (product_id);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- Public (anon)   : read ACTIVE products and categories only. No access to
--                   orders or order_items.
-- Owner (auth)    : full read/write via the authenticated role.
-- Order creation  : intentionally has NO public insert policy. It will be
--                   handled by a validated server-side/RPC workflow later.
-- ============================================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Table privileges (RLS still filters the rows).
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products
  to authenticated;
grant select, insert, update, delete on public.orders, public.order_items
  to authenticated;

-- --- categories ------------------------------------------------------------
drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
  on public.categories
  for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Owners manage categories" on public.categories;
create policy "Owners manage categories"
  on public.categories
  for all
  to authenticated
  using (true)
  with check (true);

-- --- products --------------------------------------------------------------
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products
  for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Owners manage products" on public.products;
create policy "Owners manage products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

-- --- orders (owner only) ---------------------------------------------------
drop policy if exists "Owners manage orders" on public.orders;
create policy "Owners manage orders"
  on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

-- --- order items (owner only) ----------------------------------------------
drop policy if exists "Owners manage order items" on public.order_items;
create policy "Owners manage order items"
  on public.order_items
  for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================================
-- Done. Next: run supabase/seed.sql to add the TokMieja sample catalog.
-- ============================================================================
