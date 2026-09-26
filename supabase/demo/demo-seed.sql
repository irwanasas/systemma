create function pg_temp.demo_order(p_agent uuid, p_slug text, p_items jsonb) returns uuid
language plpgsql
as $$
declare
  item jsonb;
  batch_id uuid;
  new_order_id uuid;
begin
  select b.id into batch_id from po_batches b join products p on p.id = b.product_id where p.slug = p_slug and b.status = 'open';
  for item in select * from jsonb_array_elements(p_items) loop
    perform cart_upsert_item(
      p_agent, batch_id, (item ->> 'qty')::int,
      (select v.id from product_variants v join product_colors c on c.id = v.color_id join products p on p.id = v.product_id
       where p.slug = p_slug and c.name = item ->> 'color' and v.size_code = item ->> 'size')
    );
  end loop;
  select order_id into new_order_id from checkout_cart(p_agent, gen_random_uuid());
  return new_order_id;
end;
$$;

create function pg_temp.demo_submit_proof(p_order uuid) returns uuid
language sql
as $$
  select submit_dp_proof(o.agent_id, o.id, o.agent_id || '/' || o.id || '/' || gen_random_uuid() || '-demo-proof.png', o.dp_amount, gen_random_uuid())
  from orders o where o.id = p_order;
$$;

create function pg_temp.demo_advance(p_order uuid, p_target text) returns void
language plpgsql
as $$
declare
  admin_id uuid := (select id from users where username = 'admin');
  steps text[] := array['DP_UNDER_REVIEW', 'DP_RECEIVED', 'IN_PRODUCTION', 'AWAITING_SETTLEMENT', 'SETTLED', 'SHIPPED', 'COMPLETED'];
  step text;
begin
  if p_target = 'CANCELLED' then
    perform cancel_order((select agent_id from orders where id = p_order), p_order);
    return;
  end if;
  if p_target = 'EXPIRED' then
    update orders set dp_due_at = now() - interval '1 hour' where id = p_order;
    perform expire_unpaid_orders();
    return;
  end if;
  foreach step in array steps loop
    if step = 'DP_UNDER_REVIEW' then
      perform pg_temp.demo_submit_proof(p_order);
    elsif step = 'DP_RECEIVED' then
      perform review_dp(admin_id, (select id from payments where order_id = p_order and status = 'PENDING'), true);
    elsif step = 'SETTLED' then
      perform mark_settled(admin_id, p_order);
    else
      perform order_transition(admin_id, p_order, step::order_status);
    end if;
    exit when step = p_target;
  end loop;
end;
$$;

update product_colors c set hex = v.hex
from products p, (values
  ('zelline', 'Hitam', '#1F1B1A'), ('zelline', 'Mocca', '#9B7A5E'), ('zelline', 'Sage', '#9CAF88'),
  ('anshara', 'Putih', '#F4F1EA'), ('anshara', 'Navy', '#22304A'),
  ('sevina-polka', 'Dusty Pink', '#D8A7A1'), ('sevina-polka', 'Cream', '#EFE3CF')
) as v(slug, name, hex)
where p.id = c.product_id and p.slug = v.slug and c.name = v.name;

insert into product_colors (product_id, name, hex, sort)
select p.id, v.name, v.hex, v.sort from products p
join (values ('zelline', 'Maroon', '#6E2A33', 4), ('anshara', 'Abu Misty', '#A9AFB3', 3), ('sevina-polka', 'Olive', '#7C7A4E', 3))
  as v(slug, name, hex, sort) on v.slug = p.slug;

update products set description = v.description
from (values
  ('zelline', 'Gamis ceruty babydoll dengan kancing depan, ramah busui. Panjang standar 140 cm.'),
  ('anshara', 'Koko katun toyobo dengan bordir kerah halus, nyaman untuk harian dan Jumat.'),
  ('sevina-polka', 'Khimar voal motif polka dua lapis, tidak menerawang, tepi dijahit rapi.')
) as v(slug, description)
where products.slug = v.slug;

insert into po_batches (product_id, batch_no, label, status, opens_at, closes_at, eta_days)
select id, 2, 'B2', 'scheduled', now() + interval '10 days', now() + interval '24 days', 45 from products where slug = 'zelline';

update app_settings set value = '[{"bank": "BCA", "number": "8730 1234 56", "holder": "CV Aurora Hijab Semarang"}, {"bank": "Mandiri", "number": "1350 0098 7654 3", "holder": "CV Aurora Hijab Semarang"}]'
where key = 'bank_accounts';
update app_settings set value = '{"name": "CV Aurora Hijab", "address": "Jl. Pandanaran No. 88, Semarang 50134", "logo_path": null}'
where key = 'invoice_header';
update app_settings set value = '"Ongkos kirim dihitung terpisah dan dikonfirmasi admin via WhatsApp sebelum pengiriman."'
where key = 'order_terms_text';

update users set must_change_password = false where username = 'admin';
update users set full_name = 'Laras Wulandari' where username = 'admin';

do $$
declare
  agent_row record;
  demo_password text;
  new_id uuid;
begin
  for agent_row in
    select * from (values
      ('siti', 'Siti Rahmawati', 'SMG01', 'Butik Siti Collection', 'Semarang', '0812 2345 6701'),
      ('dewi', 'Dewi Lestari', 'SLO01', 'Dewi Hijab Store', 'Solo', '0813 9876 5402'),
      ('nuraini', 'Nur Aini', 'YGY01', 'Aini Modest Wear', 'Yogyakarta', '0857 1122 3303'),
      ('fitri', 'Fitri Handayani', 'KDS01', 'Fitri Busana Muslim', 'Kudus', '0878 5566 7704'),
      ('rina', 'Rina Marlina', 'SMG02', 'Rina Gallery', 'Semarang', '0819 4433 2205')
    ) as seed(username, full_name, code, business_name, city, phone)
  loop
    demo_password := translate(encode(extensions.gen_random_bytes(12), 'base64'), '+/', 'xy');
    new_id := create_agent(agent_row.username::citext, extensions.crypt(demo_password, extensions.gen_salt('bf', 12)),
                           agent_row.full_name, agent_row.code, agent_row.phone, agent_row.business_name, agent_row.city);
    update users set must_change_password = false where id = new_id;
    raise notice 'demo login: % / %', agent_row.username, demo_password;
  end loop;
end
$$;

do $$
declare
  siti uuid := (select id from users where username = 'siti');
  dewi uuid := (select id from users where username = 'dewi');
  aini uuid := (select id from users where username = 'nuraini');
  fitri uuid := (select id from users where username = 'fitri');
  rina uuid := (select id from users where username = 'rina');
  admin_id uuid := (select id from users where username = 'admin');
  order_id uuid;
  payment_id uuid;
begin
  order_id := pg_temp.demo_order(siti, 'zelline', '[{"color":"Hitam","size":"M","qty":6},{"color":"Hitam","size":"L","qty":4},{"color":"Mocca","size":"L","qty":3},{"color":"Sage","size":"XL","qty":2}]');
  perform pg_temp.demo_advance(order_id, 'COMPLETED');
  update orders set created_at = now() - interval '52 days' where id = order_id;

  order_id := pg_temp.demo_order(dewi, 'anshara', '[{"color":"Putih","size":"L","qty":8},{"color":"Navy","size":"XL","qty":5}]');
  perform pg_temp.demo_advance(order_id, 'COMPLETED');
  update orders set created_at = now() - interval '47 days' where id = order_id;

  order_id := pg_temp.demo_order(aini, 'sevina-polka', '[{"color":"Dusty Pink","size":"M","qty":12},{"color":"Cream","size":"M","qty":10}]');
  perform pg_temp.demo_advance(order_id, 'SHIPPED');
  update orders set created_at = now() - interval '41 days' where id = order_id;

  order_id := pg_temp.demo_order(fitri, 'zelline', '[{"color":"Maroon","size":"M","qty":4},{"color":"Hitam","size":"S","qty":3}]');
  perform pg_temp.demo_advance(order_id, 'SETTLED');
  update orders set created_at = now() - interval '38 days' where id = order_id;

  order_id := pg_temp.demo_order(rina, 'anshara', '[{"color":"Abu Misty","size":"M","qty":6},{"color":"Navy","size":"L","qty":6}]');
  perform pg_temp.demo_advance(order_id, 'AWAITING_SETTLEMENT');
  update orders set created_at = now() - interval '33 days' where id = order_id;

  order_id := pg_temp.demo_order(siti, 'sevina-polka', '[{"color":"Olive","size":"M","qty":15}]');
  perform pg_temp.demo_advance(order_id, 'IN_PRODUCTION');
  update orders set created_at = now() - interval '12 days' where id = order_id;

  order_id := pg_temp.demo_order(dewi, 'zelline', '[{"color":"Sage","size":"M","qty":5},{"color":"Mocca","size":"XXL","qty":2}]');
  perform pg_temp.demo_advance(order_id, 'IN_PRODUCTION');
  update orders set created_at = now() - interval '9 days' where id = order_id;

  order_id := pg_temp.demo_order(aini, 'anshara', '[{"color":"Putih","size":"M","qty":4}]');
  perform pg_temp.demo_advance(order_id, 'DP_RECEIVED');
  update orders set created_at = now() - interval '4 days' where id = order_id;

  order_id := pg_temp.demo_order(fitri, 'sevina-polka', '[{"color":"Cream","size":"M","qty":8},{"color":"Dusty Pink","size":"M","qty":6}]');
  payment_id := pg_temp.demo_submit_proof(order_id);
  perform review_dp(admin_id, payment_id, false, 'Nominal pada bukti tidak terbaca. Mohon unggah foto yang lebih jelas.');
  perform pg_temp.demo_submit_proof(order_id);

  order_id := pg_temp.demo_order(rina, 'zelline', '[{"color":"Hitam","size":"XL","qty":3},{"color":"Maroon","size":"L","qty":3}]');
  perform pg_temp.demo_advance(order_id, 'DP_UNDER_REVIEW');

  order_id := pg_temp.demo_order(siti, 'anshara', '[{"color":"Navy","size":"M","qty":10},{"color":"Putih","size":"XL","qty":4}]');

  order_id := pg_temp.demo_order(dewi, 'sevina-polka', '[{"color":"Olive","size":"M","qty":6}]');

  order_id := pg_temp.demo_order(aini, 'zelline', '[{"color":"Mocca","size":"S","qty":2}]');
  perform pg_temp.demo_advance(order_id, 'CANCELLED');
  update orders set created_at = now() - interval '6 days' where id = order_id;

  order_id := pg_temp.demo_order(fitri, 'anshara', '[{"color":"Putih","size":"S","qty":3}]');
  perform pg_temp.demo_advance(order_id, 'EXPIRED');
  update orders set created_at = now() - interval '3 days' where id = order_id;

  perform cart_upsert_item(siti, (select b.id from po_batches b join products p on p.id = b.product_id where p.slug = 'zelline' and b.status = 'open'), 4,
    (select v.id from product_variants v join product_colors c on c.id = v.color_id join products p on p.id = v.product_id where p.slug = 'zelline' and c.name = 'Sage' and v.size_code = 'L'));
  perform cart_upsert_item(siti, (select b.id from po_batches b join products p on p.id = b.product_id where p.slug = 'sevina-polka' and b.status = 'open'), 6,
    (select v.id from product_variants v join product_colors c on c.id = v.color_id join products p on p.id = v.product_id where p.slug = 'sevina-polka' and c.name = 'Dusty Pink' and v.size_code = 'M'));

  insert into announcements (title, body, author_id, published_at) values
    ('Batch B2 Zelline dibuka bulan depan', 'Pre-order B2 untuk Zelline dibuka tanggal 6 dengan tambahan warna Maroon. Estimasi selesai 45 hari setelah DP disetujui.', admin_id, now() - interval '2 days'),
    ('Libur produksi Idul Adha', 'Produksi libur 3 hari. Estimasi selesai pesanan yang sedang diproduksi mundur 3 hari; admin akan mengonfirmasi lewat WhatsApp.', admin_id, now() - interval '9 days');
end
$$;
