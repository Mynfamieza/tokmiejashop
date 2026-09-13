-- ============================================================================
-- TokMieja Shop - Product image gallery (Option A)
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Safe to re-run. Non-destructive.
--
-- WHAT THIS DOES
--   Adds two nullable gallery columns to public.products:
--     image_url_2 - inside/contents photo
--     image_url_3 - texture/serving photo
--   image_url remains the main photo and the source for cards/OG metadata.
--
-- No other tables, RLS, storage policies or functions are changed. The
-- existing `product-images` bucket and its policies are reused unchanged.
-- ============================================================================

alter table public.products
  add column if not exists image_url_2 text,
  add column if not exists image_url_3 text;

comment on column public.products.image_url_2 is
  'Gallery image 2 (inside/contents photo). NULL when not provided.';
comment on column public.products.image_url_3 is
  'Gallery image 3 (texture/serving photo). NULL when not provided.';

-- ============================================================================
-- Done. Existing products (image_url only) continue to work unchanged.
-- ============================================================================
