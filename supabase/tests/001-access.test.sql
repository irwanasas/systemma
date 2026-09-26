begin;
select plan(5);

select is_empty(
  $$ select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity $$,
  'every public table has RLS enabled'
);

select is_empty(
  $$ select tablename from pg_policies where schemaname = 'public' $$,
  'no RLS policies exist, so anon and authenticated are denied'
);

select is_empty(
  $$ select table_name || ':' || grantee || ':' || privilege_type
     from information_schema.role_table_grants
     where table_schema = 'public' and grantee in ('anon', 'authenticated') $$,
  'anon and authenticated have no table privileges'
);

select is_empty(
  $$ select p.proname from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
       and (has_function_privilege('anon', p.oid, 'execute')
            or has_function_privilege('authenticated', p.oid, 'execute')) $$,
  'anon and authenticated cannot execute any app function'
);

select is_empty(
  $$ select t from unnest(array['orders', 'order_items', 'payments', 'invoices', 'carts', 'cart_items']) t
     where has_table_privilege('service_role', t, 'insert')
        or has_table_privilege('service_role', t, 'update')
        or has_table_privilege('service_role', t, 'delete') $$,
  'orders, items, payments, invoices and carts are written only through RPCs'
);

select * from finish();
rollback;
