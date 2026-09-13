-- ============================================================================
-- TokMieja Shop - Phase 12: courier + tracking number
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Safe to re-run. Non-destructive.
--
-- WHAT THIS DOES
--   1. Adds nullable `courier` and `tracking_number` to public.orders.
--   2. Replaces get_order_tracking so the customer tracking page also shows
--      the courier and tracking number when the owner has set them.
--
-- No other tables, policies, RLS or functions change. Only owners can write
-- these columns (they live on public.orders, which is owner-only under RLS).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns
-- ----------------------------------------------------------------------------
alter table public.orders
  add column if not exists courier text,
  add column if not exists tracking_number text;

alter table public.orders drop constraint if exists orders_courier_length;
alter table public.orders
  add constraint orders_courier_length check (courier is null or length(courier) <= 100);

alter table public.orders drop constraint if exists orders_tracking_number_length;
alter table public.orders
  add constraint orders_tracking_number_length
  check (tracking_number is null or length(tracking_number) <= 100);

comment on column public.orders.courier is
  'Optional courier company set by the owner (e.g. J&T, Pos Laju).';
comment on column public.orders.tracking_number is
  'Optional courier tracking number set by the owner.';

-- ----------------------------------------------------------------------------
-- 2. get_order_tracking: same security model, now also returns courier +
--    tracking number. Still requires BOTH the order number and the phone
--    number used at checkout; still omits customer name/phone/email/address.
-- ----------------------------------------------------------------------------
create or replace function public.get_order_tracking(
  p_order_number text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_number text;
  v_phone text;
begin
  v_number := btrim(coalesce(p_order_number, ''));
  v_phone := public.normalize_my_phone(p_phone);

  if length(v_number) = 0 or length(v_number) > 64 or length(v_phone) < 8 then
    return null;
  end if;

  select * into v_order
  from public.orders
  where order_number = v_number
    and public.normalize_my_phone(customer_phone) = v_phone
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'order_number', v_order.order_number,
    'created_at', v_order.created_at,
    'status', v_order.status,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'subtotal', v_order.subtotal,
    'delivery_fee', v_order.delivery_fee,
    'total', v_order.total,
    'courier', v_order.courier,
    'tracking_number', v_order.tracking_number,
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal
          )
          order by oi.created_at
        )
        from public.order_items oi
        where oi.order_id = v_order.id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.get_order_tracking(text, text) from public;
grant execute on function public.get_order_tracking(text, text) to anon, authenticated;

-- ============================================================================
-- Done. Run this manually in the Supabase SQL Editor.
-- ============================================================================
