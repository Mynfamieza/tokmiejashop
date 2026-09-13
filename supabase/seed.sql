-- ============================================================================
-- TokMieja Shop - seed data (Phase 1)
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Run supabase/schema.sql FIRST, then run this file in the
--   Supabase Dashboard -> SQL Editor.
--
-- Safe to re-run (`on conflict (slug) do nothing`).
--
-- NOTE: Prices and descriptions below are intentionally short placeholders.
-- Edit them to match the real TokMieja menu. No ingredients, certifications,
-- nutrition or marketing claims are included on purpose.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug, active, sort_order)
values
  ('Sambal', 'sambal', true, 1),
  ('Cookies', 'cookies', true, 2)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
insert into public.products (
  name,
  slug,
  description,
  price,
  image_url,
  category,
  active,
  featured,
  stock_quantity
)
values
  (
    'Sambal Garing Bilis Pucuk Ubi',
    'sambal-garing-bilis-pucuk-ubi',
    'Sambal garing dengan bilis dan pucuk ubi.',
    13.00,
    null,
    'sambal',
    true,
    true,
    50
  ),
  (
    'Sambal Paru Crunch',
    'sambal-paru-crunch',
    'Sambal paru yang rangup.',
    15.00,
    null,
    'sambal',
    true,
    true,
    30
  ),
  (
    'Biskut Buah Pinggang',
    'biskut-buah-pinggang',
    'Biskut klasik untuk minum petang.',
    12.00,
    null,
    'cookies',
    true,
    true,
    40
  )
on conflict (slug) do nothing;

-- ============================================================================
-- Done. Verify with:
--   select name, price, category, active, featured from public.products;
-- ============================================================================
