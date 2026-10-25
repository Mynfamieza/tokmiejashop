-- Retire the legacy gateway callback without deleting its function, secrets,
-- payment columns, historical records, or earlier migrations.
-- Apply AFTER existing migrations. Safe to re-run; no order data is changed.
-- Do not re-run phase7b after this migration (it grants callback access again).
-- create_order already accepts pay_now and initializes it as unpaid in Phase 6
-- and phase10_2_cod_delivery_fee.sql. No order-creation rewrite is required.
-- Owners continue to manage payment_status through the existing owner RLS.

begin;

do $$
begin
  if to_regprocedure(
    'public.process_toyyibpay_callback(text,text,text,text,text,text,text,text)'
  ) is not null then
    revoke execute on function public.process_toyyibpay_callback(
      text, text, text, text, text, text, text, text
    ) from public, anon, authenticated;
  end if;
end;
$$;

commit;
