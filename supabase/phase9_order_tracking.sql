-- ============================================================================
-- TokMieja Shop - Phase 9: customer order tracking
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Safe to re-run. No tables are changed and RLS is not modified.
--
-- WHY THIS IS NEEDED
--   Anonymous customers cannot read public.orders (RLS blocks it by design).
--   Order tracking must verify BOTH the order number and the phone number used
--   at checkout, so this adds a SECURITY DEFINER function that returns only a
--   sanitized summary when both fields match. Order number alone never returns
--   an order.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Phone normalisation (Malaysian friendly): strip non-digits, and treat a
-- leading 60 country code as local 0 so "+60123..." and "0123..." match.
-- ----------------------------------------------------------------------------
create or replace function public.normalize_my_phone(p_value text)
returns text
language sql
immutable
as $$
  with d as (
    select regexp_replace(coalesce(p_value, ''), '[^0-9]', '', 'g') as digits
  )
  select case
    when length(d.digits) >= 10 and left(d.digits, 2) = '60'
      then '0' || substring(d.digits from 3)
    else d.digits
  end
  from d;
$$;

-- ----------------------------------------------------------------------------
-- get_order_tracking: returns a sanitized order summary only when the order
-- number AND phone number both match. Returns NULL otherwise (no distinction,
-- so the caller cannot enumerate orders).
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
-- Done. The function intentionally omits customer name, phone, email, address
-- and every internal id from its response.
-- ============================================================================
