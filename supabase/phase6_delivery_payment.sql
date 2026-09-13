-- ============================================================================
-- TokMieja Shop - Phase 6: delivery fee, free delivery & payment foundation
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Run this AFTER phase3_order_creation.sql and phase4_owner_management.sql.
--
-- Safe to re-run.
--
-- WHAT THIS DOES
--   1. Adds payment_method, payment_status and location_pin to public.orders
--      (delivery_fee already exists). Existing rows are preserved.
--   2. Adds CHECK constraints for payment method/status and the location pin.
--   3. Adds a Kulim address helper (isolated so it can be replaced later).
--   4. Replaces create_order so the SERVER calculates delivery fee, free
--      delivery, total, payment method eligibility and payment status.
--
-- Business rules:
--   * Standard delivery RM6 (no minimum order).
--   * FREE delivery when total product quantity >= 5 jars/bottles.
--   * pay_now -> payment_status 'unpaid'; cod -> 'pending'.
--   * COD is only allowed for Kulim addresses (checked server-side).
--
-- Does NOT touch auth, RLS policies, stock logic, idempotency or snapshots.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns
-- ----------------------------------------------------------------------------
alter table public.orders
  add column if not exists payment_method text not null default 'pay_now',
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists location_pin text;

-- ----------------------------------------------------------------------------
-- 2. Constraints
-- ----------------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('pay_now', 'cod'));

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'pending', 'paid', 'failed', 'refunded'));

alter table public.orders drop constraint if exists orders_location_pin_url_check;
alter table public.orders
  add constraint orders_location_pin_url_check
  check (location_pin is null or location_pin ~* '^https?://');

-- ----------------------------------------------------------------------------
-- 3. Index
-- ----------------------------------------------------------------------------
create index if not exists orders_payment_status_idx
  on public.orders (payment_status);

-- ----------------------------------------------------------------------------
-- 4. Kulim helper (conservative; isolated for future replacement)
-- ----------------------------------------------------------------------------
create or replace function public.is_kulim_address(p_address text)
returns boolean
language sql
immutable
as $$
  select p_address is not null
    and btrim(p_address) <> ''
    and p_address ~* '(^|[^a-z0-9])kulim([^a-z0-9]|$)';
$$;

-- ----------------------------------------------------------------------------
-- 5. Summary builder (now includes delivery + payment fields)
-- ----------------------------------------------------------------------------
create or replace function public.build_order_summary(p_order public.orders)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'order_number', p_order.order_number,
    'customer_name', p_order.customer_name,
    'status', p_order.status,
    'delivery_address', p_order.delivery_address,
    'location_pin', p_order.location_pin,
    'payment_method', p_order.payment_method,
    'payment_status', p_order.payment_status,
    'subtotal', p_order.subtotal,
    'delivery_fee', p_order.delivery_fee,
    'total', p_order.total,
    'created_at', p_order.created_at,
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
        where oi.order_id = p_order.id
      ),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.build_order_summary(public.orders) from public;

-- ----------------------------------------------------------------------------
-- 6. Replaced create_order (new signature)
-- ----------------------------------------------------------------------------
drop function if exists public.create_order(
  text, text, text, text, text, jsonb, text
);

create or replace function public.create_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_delivery_address text,
  p_notes text,
  p_items jsonb,
  p_idempotency_key text,
  p_payment_method text,
  p_location_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.orders%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10, 2) := 0;
  v_delivery_fee numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_line numeric(10, 2);
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id uuid;
  v_qty integer;
  v_item_count integer := 0;
  v_key text;
  v_payment_method text;
  v_payment_status text;
  v_location_pin text;
begin
  -- --- validate customer input -------------------------------------------
  if p_customer_name is null or length(btrim(p_customer_name)) < 2 then
    raise exception 'NAMA_REQUIRED';
  end if;

  if p_customer_phone is null
     or length(regexp_replace(p_customer_phone, '[^0-9]', '', 'g')) < 8 then
    raise exception 'TELEFON_REQUIRED';
  end if;

  if p_delivery_address is null or length(btrim(p_delivery_address)) < 5 then
    raise exception 'ALAMAT_REQUIRED';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'TIADA_ITEM';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'TERLALU_BANYAK_ITEM';
  end if;

  -- --- validate payment method + location pin ----------------------------
  v_payment_method := lower(btrim(coalesce(p_payment_method, '')));
  if v_payment_method not in ('pay_now', 'cod') then
    raise exception 'KAEDAH_BAYARAN_TIDAK_SAH';
  end if;

  v_location_pin := nullif(btrim(coalesce(p_location_pin, '')), '');
  if v_location_pin is not null
     and (length(v_location_pin) > 500 or v_location_pin !~* '^https?://') then
    raise exception 'PIN_TIDAK_SAH';
  end if;

  -- COD is Kulim-only, enforced server-side.
  if v_payment_method = 'cod'
     and not public.is_kulim_address(p_delivery_address) then
    raise exception 'COD_TIDAK_LAYAK';
  end if;

  v_payment_status := case
    when v_payment_method = 'cod' then 'pending'
    else 'unpaid'
  end;

  v_key := nullif(btrim(coalesce(p_idempotency_key, '')), '');

  -- --- idempotency -------------------------------------------------------
  if v_key is not null then
    select * into v_existing from public.orders where idempotency_key = v_key;
    if found then
      return public.build_order_summary(v_existing);
    end if;
  end if;

  -- --- order number ------------------------------------------------------
  v_order_number :=
    'TM-'
    || to_char(timezone('Asia/Kuala_Lumpur', now()), 'YYYYMMDD')
    || '-'
    || lpad(nextval('public.order_number_seq')::text, 3, '0');

  -- --- create order header (totals filled in below) ----------------------
  begin
    insert into public.orders (
      order_number, customer_name, customer_phone, customer_email,
      delivery_address, notes, subtotal, delivery_fee, total, status,
      idempotency_key, payment_method, payment_status, location_pin
    )
    values (
      v_order_number,
      btrim(p_customer_name),
      btrim(p_customer_phone),
      nullif(btrim(coalesce(p_customer_email, '')), ''),
      btrim(p_delivery_address),
      nullif(btrim(coalesce(p_notes, '')), ''),
      0, 0, 0, 'pending',
      v_key, v_payment_method, v_payment_status, v_location_pin
    )
    returning id into v_order_id;
  exception
    when unique_violation then
      select * into v_existing
        from public.orders
        where idempotency_key = v_key;
      if found then
        return public.build_order_summary(v_existing);
      end if;
      raise;
  end;

  -- --- validate + price every line from the database ---------------------
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
    exception
      when others then
        raise exception 'PRODUK_TIDAK_DITEMUI';
    end;

    begin
      v_qty := (v_item ->> 'quantity')::int;
    exception
      when others then
        raise exception 'KUANTITI_TIDAK_SAH';
    end;

    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'KUANTITI_TIDAK_SAH';
    end if;

    select * into v_product
      from public.products
      where id = v_product_id
      for update;

    if not found then
      raise exception 'PRODUK_TIDAK_DITEMUI';
    end if;

    if v_product.active is not true then
      raise exception 'PRODUK_TIDAK_AKTIF';
    end if;

    if v_product.stock_quantity < v_qty then
      raise exception 'STOK_TIDAK_CUKUP';
    end if;

    v_line := v_product.price * v_qty;
    v_subtotal := v_subtotal + v_line;

    insert into public.order_items (
      order_id, product_id, product_name, unit_price, quantity, subtotal
    )
    values (
      v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_line
    );

    update public.products
      set stock_quantity = stock_quantity - v_qty
      where id = v_product.id;

    v_item_count := v_item_count + v_qty;
  end loop;

  -- --- delivery fee / free delivery (server-side, quantity based) --------
  v_delivery_fee := case when v_item_count >= 5 then 0.00 else 6.00 end;
  v_total := v_subtotal + v_delivery_fee;

  update public.orders
    set subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        total = v_total
    where id = v_order_id;

  select * into v_existing from public.orders where id = v_order_id;
  return public.build_order_summary(v_existing);
end;
$$;

revoke all on function public.create_order(
  text, text, text, text, text, jsonb, text, text, text
) from public;

grant execute on function public.create_order(
  text, text, text, text, text, jsonb, text, text, text
) to anon, authenticated;

-- ============================================================================
-- Done.
-- ============================================================================
