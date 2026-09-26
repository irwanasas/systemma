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
