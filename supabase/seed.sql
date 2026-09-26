do $$
declare
  seed_user record;
  seed_password text;
  seed_user_id uuid;
begin
  for seed_user in
    select * from (values
      ('admin', 'admin'::app_role, 'Admin Aurora', null, null, null),
      ('agen1', 'agent'::app_role, 'Agen Satu', 'AG001', 'Toko Satu', 'Semarang'),
      ('agen2', 'agent'::app_role, 'Agen Dua', 'AG002', 'Toko Dua', 'Solo'),
      ('agen3', 'agent'::app_role, 'Agen Tiga', 'AG003', 'Toko Tiga', 'Yogyakarta')
    ) as seed(username, role, full_name, code, business_name, city)
  loop
    seed_password := translate(encode(extensions.gen_random_bytes(12), 'base64'), '+/', 'xy');
    insert into users (username, password_hash, role, full_name)
    values (seed_user.username, extensions.crypt(seed_password, extensions.gen_salt('bf', 12)), seed_user.role, seed_user.full_name)
    returning id into seed_user_id;
    if seed_user.role = 'agent' then
      insert into agents (user_id, code, business_name, city)
      values (seed_user_id, seed_user.code, seed_user.business_name, seed_user.city);
    end if;
    raise notice 'seed login: % / %', seed_user.username, seed_password;
  end loop;
end
$$;

do $$
declare
  seed_product record;
  seed_product_id uuid;
  seed_color text;
  seed_color_sort int;
begin
  for seed_product in
    select * from (values
      ('zelline', 'Zelline', 'dress', array['Hitam', 'Mocca', 'Sage'], 250000, 275000, true, 350000),
      ('anshara', 'Anshara', 'koko', array['Putih', 'Navy'], 185000, 205000, false, null),
      ('sevina-polka', 'Sevina Polka', 'khimar_voal', array['Dusty Pink', 'Cream'], 95000, 105000, false, null)
    ) as seed(slug, name, category_code, colors, base_price, big_price, custom_enabled, custom_price)
  loop
    insert into products (slug, name, category_id, status, custom_size_enabled, custom_unit_price)
    select seed_product.slug, seed_product.name, id, 'active', seed_product.custom_enabled, seed_product.custom_price
    from categories where code = seed_product.category_code
    returning id into seed_product_id;

    seed_color_sort := 0;
    foreach seed_color in array seed_product.colors loop
      seed_color_sort := seed_color_sort + 1;
      insert into product_colors (product_id, name, sort) values (seed_product_id, seed_color, seed_color_sort);
    end loop;

    insert into size_prices (product_id, size_code, unit_price)
    select seed_product_id, code, case when code in ('XL', 'XXL') then seed_product.big_price else seed_product.base_price end
    from sizes;

    insert into po_batches (product_id, batch_no, label, status, opens_at, closes_at)
    values (seed_product_id, 1, 'B1', 'open', now(), now() + interval '14 days');
  end loop;
end
$$;
