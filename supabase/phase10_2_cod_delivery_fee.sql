-- ============================================================================
-- TokMieja Shop - COD delivery fee (RM2) adjustment
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
--   Safe to re-run.
--
-- WHY
--   Delivery remains FREE for 5+ jars for both payment methods, and Pay Now
--   stays RM6 for 1-4 jars. COD is now RM2 for 1-4 jars.
--
-- This only replaces the create_order function so the SERVER (source of truth)
-- applies the COD fee. It changes no tables, columns, RLS or any other function.
-- ============================================================================

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
  -- 5+ jars: FREE for both methods. 1-4 jars: RM6 Pay Now, RM2 COD.
  v_delivery_fee := case
    when v_item_count >= 5 then 0.00
    when v_payment_method = 'cod' then 2.00
    else 6.00
  end;
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
-- Done. Sales/totals/stock/idempotency behaviour is unchanged.
-- ============================================================================
