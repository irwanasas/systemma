begin;
select plan(26);

insert into users (id, username, password_hash, role, full_name) values
  ('00000000-0000-0000-0000-00000000a001', 't-agent', 'x', 'agent', 'Tes Agen'),
  ('00000000-0000-0000-0000-00000000a002', 't-other', 'x', 'agent', 'Agen Lain'),
  ('00000000-0000-0000-0000-00000000a003', 't-admin', 'x', 'admin', 'Tes Admin');
insert into agents (user_id, code) values
  ('00000000-0000-0000-0000-00000000a001', 'T001'),
  ('00000000-0000-0000-0000-00000000a002', 'T002');

insert into products (id, slug, name, category_id, status, custom_size_enabled, custom_unit_price)
select '00000000-0000-0000-0000-00000000b001', 't-zelline', 'Zelline', id, 'active', true, 350000 from categories where code = 'dress';
insert into products (id, slug, name, category_id, status)
select '00000000-0000-0000-0000-00000000b002', 't-anshara', 'Anshara', id, 'active' from categories where code = 'koko';

insert into product_colors (id, product_id, name) values
  ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b001', 'Hitam'),
  ('00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-00000000b002', 'Putih');
insert into size_prices (product_id, size_code, unit_price) values
  ('00000000-0000-0000-0000-00000000b001', 'M', 250001),
  ('00000000-0000-0000-0000-00000000b002', 'L', 185000);
insert into po_batches (id, product_id, batch_no, label, status) values
  ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000b001', 1, 'B1', 'open'),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000b002', 1, 'B1', 'open');

create temp table ids as
select
  (select id from product_variants where color_id = '00000000-0000-0000-0000-00000000c001' and size_code = 'M') as zelline_m,
  (select id from product_variants where color_id = '00000000-0000-0000-0000-00000000c001' and size_code = 'S') as zelline_s,
  (select id from product_variants where color_id = '00000000-0000-0000-0000-00000000c002' and size_code = 'L') as anshara_l;

select lives_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 2, (select zelline_m from ids)) $$,
  'agent adds a standard item'
);
select lives_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 3, (select zelline_m from ids)) $$,
  'setting the same variant again updates the quantity'
);
select is(
  (select qty from cart_items where variant_id = (select zelline_m from ids)),
  3,
  'quantity is replaced, not duplicated'
);
select throws_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 1, (select zelline_s from ids)) $$,
  'VARIANT_NOT_AVAILABLE',
  'a size without a price cannot be added'
);
select throws_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 1, (select anshara_l from ids)) $$,
  'VARIANT_NOT_AVAILABLE',
  'a variant from another product cannot be added to this batch'
);
select lives_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 1, null,
       '00000000-0000-0000-0000-00000000c001', 120, 140) $$,
  'agent adds a custom-size item'
);
select throws_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 1, null,
       '00000000-0000-0000-0000-00000000c001', 120, 146) $$,
  'CUSTOM_SIZE_OUT_OF_RANGE',
  'custom length above 145 cm is rejected'
);
select throws_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d002', 1, null,
       '00000000-0000-0000-0000-00000000c002', 100, 100) $$,
  'CUSTOM_SIZE_NOT_AVAILABLE',
  'custom size is rejected when the product does not offer it'
);
select lives_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d002', 4, (select anshara_l from ids)) $$,
  'agent adds an item from a second batch'
);
select throws_ok(
  $$ select cart_upsert_item('00000000-0000-0000-0000-00000000a003', '00000000-0000-0000-0000-00000000d002', 1, (select anshara_l from ids)) $$,
  'FORBIDDEN',
  'admins cannot use the agent cart'
);

update size_prices set unit_price = 999999 where product_id = '00000000-0000-0000-0000-00000000b002';
update size_prices set unit_price = 185000 where product_id = '00000000-0000-0000-0000-00000000b002';

create temp table checkout_result as
select * from checkout_cart('00000000-0000-0000-0000-00000000a001', '11111111-1111-1111-1111-111111111111');

select is((select count(*)::int from checkout_result), 2, 'a cart with two batches becomes two orders');
select is(
  (select count(distinct po_batch_id)::int from orders where agent_id = '00000000-0000-0000-0000-00000000a001'),
  2,
  'each order belongs to exactly one batch'
);
select results_eq(
  $$ select subtotal, dp_amount, settlement_amount from orders
     where po_batch_id = '00000000-0000-0000-0000-00000000d001' and agent_id = '00000000-0000-0000-0000-00000000a001' $$,
  $$ values (1100003::bigint, 275001::bigint, 825002::bigint) $$,
  'DP is 25% rounded up and settlement is the rest'
);
select ok(
  (select bool_and(status = 'AWAITING_DP' and dp_due_at between now() + interval '23 hours 59 minutes' and now() + interval '24 hours 1 minute')
   from orders where agent_id = '00000000-0000-0000-0000-00000000a001'),
  'orders start as AWAITING_DP with a 24h DP deadline'
);
select ok(
  (select bool_and(number ~ '^AUR-\d{4}-\d{6}$') from orders where agent_id = '00000000-0000-0000-0000-00000000a001'),
  'order numbers follow AUR-YYYY-SEQ6'
);
select is(
  (select count(*)::int from cart_items ci join carts c on c.id = ci.cart_id where c.agent_id = '00000000-0000-0000-0000-00000000a001'),
  0,
  'checkout clears the cart'
);

update size_prices set unit_price = 300000 where product_id = '00000000-0000-0000-0000-00000000b001';
select is(
  (select unit_price from order_items oi join orders o on o.id = oi.order_id
   where o.agent_id = '00000000-0000-0000-0000-00000000a001' and oi.size_code = 'M'),
  250001::bigint,
  'order item prices are snapshots, unaffected by later price changes'
);

select set_eq(
  $$ select order_id from checkout_cart('00000000-0000-0000-0000-00000000a001', '11111111-1111-1111-1111-111111111111') $$,
  $$ select order_id from checkout_result $$,
  'the same idempotency key returns the same orders'
);
select is(
  (select count(*)::int from orders where agent_id = '00000000-0000-0000-0000-00000000a001'),
  2,
  'repeating the checkout creates no extra orders'
);
select throws_ok(
  $$ select * from checkout_cart('00000000-0000-0000-0000-00000000a001', '22222222-2222-2222-2222-222222222222') $$,
  'CART_EMPTY',
  'a new key with an empty cart is rejected'
);
select is(
  (select count(*)::int from notifications where kind = 'ORDER_PLACED' and payload ->> 'agent_code' = 'T001'),
  2 * (select count(*)::int from users where role = 'admin' and is_active),
  'every active admin is notified once per order, with the agent code'
);

select throws_ok(
  format($$ select cancel_order('00000000-0000-0000-0000-00000000a002', %L) $$,
         (select order_id from checkout_result order by order_number limit 1)),
  'ORDER_NOT_FOUND',
  'another agent cannot cancel the order'
);
select lives_ok(
  format($$ select cancel_order('00000000-0000-0000-0000-00000000a001', %L) $$,
         (select order_id from checkout_result order by order_number limit 1)),
  'the owner can cancel before DP'
);
select throws_ok(
  format($$ select cancel_order('00000000-0000-0000-0000-00000000a001', %L) $$,
         (select order_id from checkout_result order by order_number limit 1)),
  'ORDER_NOT_CANCELLABLE',
  'a cancelled order cannot be cancelled again'
);

update orders set status = 'DP_UNDER_REVIEW' where id = (select order_id from checkout_result order by order_number desc limit 1);
select throws_ok(
  format($$ select cancel_order('00000000-0000-0000-0000-00000000a001', %L) $$,
         (select order_id from checkout_result order by order_number desc limit 1)),
  'ORDER_NOT_CANCELLABLE',
  'an order with a submitted DP proof cannot be cancelled'
);

select ok(
  not has_table_privilege('service_role', 'orders', 'insert')
  and not has_table_privilege('service_role', 'orders', 'update')
  and not has_table_privilege('service_role', 'order_items', 'insert')
  and not has_table_privilege('service_role', 'cart_items', 'update')
  and has_table_privilege('service_role', 'orders', 'select'),
  'the service role can read orders but only RPCs can write them'
);

select * from finish();
rollback;
