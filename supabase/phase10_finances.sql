-- ============================================================================
-- TokMieja Shop - Phase 10: sales, expenses & estimated profit
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Safe to re-run.
--
-- WHAT THIS DOES
--   1. Adds `products.cost_price` (estimated cost per unit) so COGS can be
--      estimated. Existing products default to 0 (unknown), which is honest -
--      no cost data is invented.
--   2. Adds an `expenses` table for simple owner-recorded expenses.
--   3. Protects expenses with RLS: only allowlisted owners (public.is_owner())
--      can read or manage them. Anonymous/customer access is denied.
--
-- This is a lightweight estimate, NOT a full accounting system.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Product cost per unit
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists cost_price numeric(10, 2) not null default 0;

alter table public.products drop constraint if exists products_cost_price_non_negative;
alter table public.products
  add constraint products_cost_price_non_negative check (cost_price >= 0);

comment on column public.products.cost_price is
  'Estimated cost per unit (RM). Used only for the owner''s estimated profit.';

-- ----------------------------------------------------------------------------
-- 2. Expenses
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric(10, 2) not null,
  description text not null,
  category text not null,
  expense_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_amount_positive check (amount > 0),
  constraint expenses_description_not_blank check (length(btrim(description)) > 0),
  constraint expenses_category_valid check (
    category in ('ingredients', 'packaging', 'delivery', 'gas', 'marketing', 'other')
  )
);

comment on table public.expenses is
  'Simple owner-recorded business expenses used for estimated profit.';

create index if not exists expenses_expense_date_idx
  on public.expenses (expense_date desc);

-- ----------------------------------------------------------------------------
-- 3. RLS: owners only
-- ----------------------------------------------------------------------------
alter table public.expenses enable row level security;

drop policy if exists "Owners manage expenses" on public.expenses;
create policy "Owners manage expenses"
  on public.expenses
  for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

grant select, insert, update, delete on public.expenses to authenticated;

-- ----------------------------------------------------------------------------
-- 4. updated_at trigger (reuses the shared helper from schema.sql)
-- ----------------------------------------------------------------------------
drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Done. Product costs and expenses are only used to show an ESTIMATED profit;
-- nothing here changes orders, stock, payments or the storefront.
-- ============================================================================
