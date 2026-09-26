begin;
select plan(6);

insert into users (id, username, password_hash, role, full_name) values
  ('00000000-0000-0000-0000-00000000a001', 't-agent-a', 'x', 'agent', 'Agen A'),
  ('00000000-0000-0000-0000-00000000a002', 't-agent-b', 'x', 'agent', 'Agen B'),
  ('00000000-0000-0000-0000-00000000a003', 't-admin', 'x', 'admin', 'Admin');
insert into agents (user_id, code) values
  ('00000000-0000-0000-0000-00000000a001', 'TA'),
  ('00000000-0000-0000-0000-00000000a002', 'TB');

insert into products (id, slug, name, category_id, status)
select '00000000-0000-0000-0000-00000000b001', 't-dress', 'Tes Dress', id, 'active' from categories where code = 'dress';
insert into products (id, slug, name, category_id, status)
select '00000000-0000-0000-0000-00000000b002', 't-koko', 'Tes Koko', id, 'active' from categories where code = 'koko';
insert into product_colors (product_id, name) values
  ('00000000-0000-0000-0000-00000000b001', 'Hitam'),
  ('00000000-0000-0000-0000-00000000b002', 'Putih');
insert into size_prices (product_id, size_code, unit_price) values
  ('00000000-0000-0000-0000-00000000b001', 'M', 100000),
  ('00000000-0000-0000-0000-00000000b001', 'L', 110000),
  ('00000000-0000-0000-0000-00000000b002', 'M', 80000);
insert into po_batches (id, product_id, batch_no, label, status) values
  ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000b001', 1, 'B1', 'open'),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000b002', 1, 'B1', 'open');

create temp table variant_of as
select p.slug, v.size_code, v.id from product_variants v join products p on p.id = v.product_id
where p.slug in ('t-dress', 't-koko') and v.is_active;

select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 3, (select id from variant_of where slug = 't-dress' and size_code = 'M'));
select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 2, (select id from variant_of where slug = 't-dress' and size_code = 'L'));
select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d002', 5, (select id from variant_of where slug = 't-koko' and size_code = 'M'));
create temp table agent_a_orders as select * from checkout_cart('00000000-0000-0000-0000-00000000a001', gen_random_uuid());

select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 1, (select id from variant_of where slug = 't-dress' and size_code = 'M'));
create temp table agent_a_second as select * from checkout_cart('00000000-0000-0000-0000-00000000a001', gen_random_uuid());

select cart_upsert_item('00000000-0000-0000-0000-00000000a002', '00000000-0000-0000-0000-00000000d001', 4, (select id from variant_of where slug = 't-dress' and size_code = 'M'));
create temp table agent_b_orders as select * from checkout_cart('00000000-0000-0000-0000-00000000a002', gen_random_uuid());
select cancel_order('00000000-0000-0000-0000-00000000a002', (select order_id from agent_b_orders));

create temp table dress_order as
select o.id from orders o join agent_a_orders r on r.order_id = o.id where o.po_batch_id = '00000000-0000-0000-0000-00000000d001';
select submit_dp_proof('00000000-0000-0000-0000-00000000a001', (select id from dress_order),
  '00000000-0000-0000-0000-00000000a001/' || (select id from dress_order) || '/p.jpg', 80000, gen_random_uuid());
select review_dp('00000000-0000-0000-0000-00000000a003', (select id from payments where order_id = (select id from dress_order)), true);
select order_transition('00000000-0000-0000-0000-00000000a003', (select id from dress_order), 'IN_PRODUCTION');
select order_transition('00000000-0000-0000-0000-00000000a003', (select id from dress_order), 'AWAITING_SETTLEMENT');
select mark_settled('00000000-0000-0000-0000-00000000a003', (select id from dress_order));

create temp table recap as select * from recap_by_agent_series(now() - interval '1 day', now() + interval '1 day') where agent_code in ('TA', 'TB');

select results_eq(
  $$ select agent_code, product_name, batch_label, order_count, qty, order_value from recap order by agent_code, product_name $$,
  $$ values ('TA'::text, 'Tes Dress'::text, 'B1'::text, 2, 6, 620000::bigint),
            ('TA', 'Tes Koko', 'B1', 1, 5, 400000::bigint) $$,
  'quantity and value per agent × series add up across orders of the same batch'
);
select is_empty($$ select 1 from recap where agent_code = 'TB' $$, 'cancelled orders are excluded');
select results_eq(
  $$ select dp_received, settlement_received from recap where product_name = 'Tes Dress' $$,
  $$ values (130000::bigint, 390000::bigint) $$,
  'only received DP and settlement amounts are counted'
);
select results_eq(
  $$ select dp_received, settlement_received from recap where product_name = 'Tes Koko' $$,
  $$ values (0::bigint, 0::bigint) $$,
  'unpaid orders contribute no received amounts'
);
select is(
  (select sum(order_value) from recap),
  (select sum(subtotal) from orders where agent_id = '00000000-0000-0000-0000-00000000a001')::numeric,
  'recap value equals the sum of order subtotals'
);
select is_empty(
  $$ select 1 from recap_by_agent_series(now() + interval '1 day', now() + interval '2 days') where agent_code = 'TA' $$,
  'orders outside the period are excluded'
);

select * from finish();
rollback;
