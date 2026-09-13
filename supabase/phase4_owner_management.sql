-- ============================================================================
-- TokMieja Shop - Phase 4: owner authorization
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Run this AFTER supabase/schema.sql and supabase/phase3_order_creation.sql.
--
-- Safe to re-run.
--
-- WHAT THIS DOES
--   1. Creates `public.owners`, an allowlist of Supabase Auth users who are
--      allowed to manage the store (orders, products, categories).
--   2. Creates `public.is_owner()` (SECURITY DEFINER) used by RLS.
--   3. Restricts the previously broad "authenticated" write policies so that
--      ONLY allowlisted owners can manage data. Public reads are unchanged.
--
-- This does NOT touch the Phase 3 create_order RPC, order numbering,
-- idempotency or stock handling.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Owner allowlist
-- ----------------------------------------------------------------------------
create table if not exists public.owners (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.owners is
  'Allowlist of Supabase Auth users with owner privileges. Managed via SQL only.';

alter table public.owners enable row level security;

-- Intentionally no RLS policies: the table is managed only through the SQL
-- editor, and access checks go through public.is_owner() below.

-- ----------------------------------------------------------------------------
-- is_owner(): true when the current request belongs to an allowlisted owner
-- ----------------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.owners where user_id = auth.uid()
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- ----------------------------------------------------------------------------
-- Replace owner policies: authenticated AND allowlisted owner only
-- (Public read policies on products/categories are left untouched.)
-- ----------------------------------------------------------------------------
drop policy if exists "Owners manage categories" on public.categories;
create policy "Owners manage categories"
  on public.categories
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "Owners manage products" on public.products;
create policy "Owners manage products"
  on public.products
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "Owners manage orders" on public.orders;
create policy "Owners manage orders"
  on public.orders
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "Owners manage order items" on public.order_items;
create policy "Owners manage order items"
  on public.order_items
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ============================================================================
-- FINAL STEP (run once, after creating your owner user in Authentication):
--
--   insert into public.owners (user_id)
--   select id from auth.users where email = 'YOUR_OWNER_EMAIL'
--   on conflict (user_id) do nothing;
--
-- Verify:
--   select u.email, o.created_at
--   from public.owners o join auth.users u on u.id = o.user_id;
-- ============================================================================
