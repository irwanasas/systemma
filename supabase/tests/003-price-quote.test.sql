begin;
select plan(12);

insert into users (id, username, password_hash, role, full_name)
values ('00000000-0000-0000-0000-00000000a001', 't-agent', 'x', 'agent', 'Tes Agen');
insert into agents (user_id, code) values ('00000000-0000-0000-0000-00000000a001', 'T001');

insert into products (id, slug, name, category_id, status, custom_size_enabled, custom_unit_price)
select '00000000-0000-0000-0000-00000000b001', 't-zelline', 'Zelline', id, 'active', true, 350000
from categories where code = 'dress';

insert into product_colors (id, product_id, name, sort) values
  ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b001', 'Hitam', 1),
  ('00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-00000000b001', 'Mocca', 2);

insert into size_prices (product_id, size_code, unit_price) values
  ('00000000-0000-0000-0000-00000000b001', 'S', 250000),
  ('00000000-0000-0000-0000-00000000b001', 'XL', 275000);

select is(
  (select count(*)::int from product_variants where product_id = '00000000-0000-0000-0000-00000000b001'),
  10,
  'a variant exists for every color × size'
);

select is(
  (select count(*)::int from product_variants where product_id = '00000000-0000-0000-0000-00000000b001' and is_active),
  4,
  'only sizes with a price are active'
);

insert into po_batches (id, product_id, batch_no, label, status)
values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000b001', 1, 'B1', 'open');

select throws_ok(
  $$ insert into po_batches (product_id, batch_no, label, status)
     values ('00000000-0000-0000-0000-00000000b001', 2, 'B2', 'open') $$,
  '23505',
  null,
  'a product has at most one open batch'
);

insert into carts (id, agent_id) values ('00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000a001');

insert into cart_items (id, cart_id, po_batch_id, product_id, variant_id, qty)
select '00000000-0000-0000-0000-00000000f001', '00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000d001', product_id, id, 3
from product_variants where color_id = '00000000-0000-0000-0000-00000000c001' and size_code = 'S';

insert into cart_items (id, cart_id, po_batch_id, product_id, variant_id, qty)
select '00000000-0000-0000-0000-00000000f002', '00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000d001', product_id, id, 2
from product_variants where color_id = '00000000-0000-0000-0000-00000000c002' and size_code = 'S';

insert into cart_items (id, cart_id, po_batch_id, product_id, variant_id, qty)
select '00000000-0000-0000-0000-00000000f003', '00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000d001', product_id, id, 1
from product_variants where color_id = '00000000-0000-0000-0000-00000000c001' and size_code = 'XL';

insert into cart_items (id, cart_id, po_batch_id, product_id, qty, custom_color_id, custom_chest_cm, custom_length_cm)
values ('00000000-0000-0000-0000-00000000f004', '00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000d001',
        '00000000-0000-0000-0000-00000000b001', 2, '00000000-0000-0000-0000-00000000c002', 120.5, 140);

select results_eq(
  $$ select unit_price, line_total, is_orderable from price_quote('00000000-0000-0000-0000-00000000e001')
     where cart_item_id = '00000000-0000-0000-0000-00000000f001' $$,
  $$ values (250000::bigint, 750000::bigint, true) $$,
  'standard size uses the size price'
);

select is(
  (select unit_price from price_quote('00000000-0000-0000-0000-00000000e001') where cart_item_id = '00000000-0000-0000-0000-00000000f002'),
  250000::bigint,
  'color never changes the price'
);

select is(
  (select unit_price from price_quote('00000000-0000-0000-0000-00000000e001') where cart_item_id = '00000000-0000-0000-0000-00000000f003'),
  275000::bigint,
  'a different size has its own price'
);

select results_eq(
  $$ select unit_price, line_total, color_name, size_code, is_orderable from price_quote('00000000-0000-0000-0000-00000000e001')
     where cart_item_id = '00000000-0000-0000-0000-00000000f004' $$,
  $$ values (350000::bigint, 700000::bigint, 'Mocca'::text, null::text, true) $$,
  'custom size uses the product custom price'
);

select is(
  (select sum(line_total) from price_quote('00000000-0000-0000-0000-00000000e001')),
  2225000::numeric,
  'cart total is the sum of line totals'
);

select throws_ok(
  $$ insert into cart_items (cart_id, po_batch_id, product_id, qty, custom_color_id, custom_chest_cm, custom_length_cm)
     values ('00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000d001',
             '00000000-0000-0000-0000-00000000b001', 1, '00000000-0000-0000-0000-00000000c002', 141, 100) $$,
  '23514',
  null,
  'custom chest above 140 cm is rejected'
);

update products set custom_size_enabled = false where id = '00000000-0000-0000-0000-00000000b001';

select results_eq(
  $$ select unit_price, is_orderable from price_quote('00000000-0000-0000-0000-00000000e001')
     where cart_item_id = '00000000-0000-0000-0000-00000000f004' $$,
  $$ values (null::bigint, false) $$,
  'custom size is not orderable once disabled'
);

delete from size_prices where product_id = '00000000-0000-0000-0000-00000000b001' and size_code = 'XL';

select is(
  (select is_orderable from price_quote('00000000-0000-0000-0000-00000000e001') where cart_item_id = '00000000-0000-0000-0000-00000000f003'),
  false,
  'a size without a price is not orderable'
);

update products set status = 'archived' where id = '00000000-0000-0000-0000-00000000b001';

select is(
  (select bool_or(is_orderable) from price_quote('00000000-0000-0000-0000-00000000e001')),
  false,
  'nothing from an archived product is orderable'
);

select * from finish();
rollback;
