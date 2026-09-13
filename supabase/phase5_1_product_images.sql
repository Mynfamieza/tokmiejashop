-- ============================================================================
-- TokMieja Shop - Phase 5.1: product image storage
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Run this AFTER supabase/phase4_owner_management.sql (it uses is_owner()).
--
-- Safe to re-run.
--
-- WHAT THIS DOES
--   1. Creates a public `product-images` Storage bucket for viewing images.
--   2. Restricts accepted files to JPEG/PNG/WebP, max 5 MB (enforced by Storage).
--   3. Adds Storage RLS policies so ONLY allowlisted owners (public.is_owner())
--      can upload, replace or delete images. Anyone may READ (view) them.
--
-- The products.image_url column remains the source of truth; no table changes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Bucket (public read, owner-only write)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- Storage policies on storage.objects
-- ----------------------------------------------------------------------------
-- Public read (storefront displays images).
drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- Only allowlisted owners may upload.
drop policy if exists "Owners can upload product images" on storage.objects;
create policy "Owners can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_owner());

-- Only allowlisted owners may replace.
drop policy if exists "Owners can update product images" on storage.objects;
create policy "Owners can update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_owner())
  with check (bucket_id = 'product-images' and public.is_owner());

-- Only allowlisted owners may delete.
drop policy if exists "Owners can delete product images" on storage.objects;
create policy "Owners can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_owner());

-- ============================================================================
-- Done. Verify the bucket exists:
--   select id, public, file_size_limit, allowed_mime_types
--   from storage.buckets where id = 'product-images';
-- ============================================================================
