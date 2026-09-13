-- ============================================================================
-- TokMieja Shop - Phase 7B: replace HitPay with ToyyibPay
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Run this AFTER phase6_delivery_payment.sql (and phase7a if you already ran
--   it; this migration is safe either way).
--
-- Safe to re-run and NON-DESTRUCTIVE:
--   * If Phase 7A ran, the hitpay_* columns are RENAMED (data preserved).
--   * If Phase 7A did not run, the toyyibpay_* columns are added fresh.
--   * HitPay functions/index are dropped; no order data is deleted.
--
-- Payment verification happens here, so the webhook route never needs a
-- service-role key: `process_toyyibpay_callback` verifies the callback hash
-- using the secret stored (privately) in public.app_settings.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Private settings table (created by 7A; recreated here if needed)
-- ----------------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create or replace function public.get_app_setting(p_key text)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select value from public.app_settings where key = p_key;
$$;

revoke all on function public.get_app_setting(text) from public;

-- ----------------------------------------------------------------------------
-- 1. Rename HitPay columns -> ToyyibPay columns (data preserved)
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name = 'hitpay_payment_request_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name = 'toyyibpay_bill_code'
  ) then
    alter table public.orders rename column hitpay_payment_request_id to toyyibpay_bill_code;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name = 'hitpay_payment_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name = 'toyyibpay_transaction_id'
  ) then
    alter table public.orders rename column hitpay_payment_id to toyyibpay_transaction_id;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name = 'hitpay_reference_number'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name = 'toyyibpay_refno'
  ) then
    alter table public.orders rename column hitpay_reference_number to toyyibpay_refno;
  end if;
end $$;

-- Fresh installs (7A never ran) / missing columns.
alter table public.orders
  add column if not exists toyyibpay_bill_code text,
  add column if not exists toyyibpay_refno text,
  add column if not exists toyyibpay_transaction_id text,
  add column if not exists payment_paid_at timestamptz;

-- ----------------------------------------------------------------------------
-- 2. Index
-- ----------------------------------------------------------------------------
drop index if exists public.orders_hitpay_payment_request_id_idx;
create index if not exists orders_toyyibpay_bill_code_idx
  on public.orders (toyyibpay_bill_code);

-- ----------------------------------------------------------------------------
-- 3. Remove HitPay-specific database logic
-- ----------------------------------------------------------------------------
drop function if exists public.process_hitpay_webhook(text, text);
drop function if exists public.verify_hitpay_signature(text, text);
delete from public.app_settings where key = 'hitpay_webhook_salt';

-- ----------------------------------------------------------------------------
-- 4. ToyyibPay callback processor
--    Hash formula (official docs):
--      MD5( userSecretKey + status + order_id + refno + "ok" )
-- ----------------------------------------------------------------------------
create or replace function public.process_toyyibpay_callback(
  p_refno text,
  p_status text,
  p_order_id text,
  p_amount text,
  p_billcode text,
  p_transaction_time text,
  p_hash text,
  p_transaction_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_secret text;
  v_expected text;
  v_order public.orders%rowtype;
  v_amount numeric(12, 2);
  v_new_status text;
begin
  -- 1. Verify the callback hash before doing anything else.
  v_secret := public.get_app_setting('toyyibpay_secret_key');
  if v_secret is null or length(v_secret) = 0 then
    raise exception 'KUNCI_TIDAK_DISET';
  end if;

  v_expected := md5(
    v_secret
    || coalesce(p_status, '')
    || coalesce(p_order_id, '')
    || coalesce(p_refno, '')
    || 'ok'
  );

  if lower(btrim(coalesce(p_hash, ''))) <> v_expected then
    raise exception 'HASH_TIDAK_SAH';
  end if;

  -- 2. Match the TokMieja order using our own reference (order number).
  if p_order_id is null or length(btrim(p_order_id)) = 0 then
    raise exception 'RUJUKAN_TIADA';
  end if;

  select * into v_order from public.orders where order_number = btrim(p_order_id);
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'order_not_found');
  end if;

  -- 3. Amount must belong to this order. ToyyibPay documents billAmount in
  --    cents; the callback amount is accepted in either RM or cents.
  begin
    v_amount := (p_amount)::numeric;
  exception
    when others then
      v_amount := null;
  end;

  if v_amount is not null
     and v_amount <> v_order.total
     and v_amount <> (v_order.total * 100) then
    return jsonb_build_object('ok', false, 'reason', 'amount_mismatch');
  end if;

  -- 4. Never downgrade a verified paid order (late/duplicate callbacks).
  if v_order.payment_status = 'paid' then
    return jsonb_build_object(
      'ok', true, 'applied', false, 'payment_status', 'paid', 'reason', 'already_paid'
    );
  end if;

  -- 5. Map ToyyibPay status: 1 = success, 2 = pending, 3 = fail.
  if btrim(coalesce(p_status, '')) = '1' then
    v_new_status := 'paid';
  elsif btrim(coalesce(p_status, '')) = '3' then
    v_new_status := 'failed';
  else
    v_new_status := 'pending';
  end if;

  -- 6. Payment confirmation updates payment state ONLY (no stock, no order).
  update public.orders
    set payment_status = v_new_status,
        toyyibpay_bill_code = coalesce(nullif(btrim(coalesce(p_billcode, '')), ''), toyyibpay_bill_code),
        toyyibpay_refno = coalesce(nullif(btrim(coalesce(p_refno, '')), ''), toyyibpay_refno),
        toyyibpay_transaction_id = coalesce(nullif(btrim(coalesce(p_transaction_id, '')), ''), toyyibpay_transaction_id),
        payment_paid_at = case
          when v_new_status = 'paid' then coalesce(payment_paid_at, now())
          else payment_paid_at
        end
    where id = v_order.id;

  return jsonb_build_object(
    'ok', true,
    'applied', true,
    'payment_status', v_new_status,
    'order_number', v_order.order_number
  );
end;
$$;

revoke all on function public.process_toyyibpay_callback(
  text, text, text, text, text, text, text, text
) from public;

grant execute on function public.process_toyyibpay_callback(
  text, text, text, text, text, text, text, text
) to anon, authenticated;

-- ============================================================================
-- FINAL STEP (run once):
--   insert into public.app_settings (key, value)
--   values ('toyyibpay_secret_key', 'YOUR_TOYYIBPAY_USER_SECRET_KEY')
--   on conflict (key) do update
--     set value = excluded.value, updated_at = now();
--
-- The same key goes in the server env var TOYYIBPAY_SECRET_KEY. It is never
-- committed to the repository.
-- ============================================================================
