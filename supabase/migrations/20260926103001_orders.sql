create table app_settings (
  key text primary key,
  value jsonb not null
);

insert into app_settings (key, value) values
  ('bank_accounts', '[]'),
  ('dp_percent', '25'),
  ('dp_window_hours', '24'),
  ('eta_days_default', '40'),
  ('custom_size_limits', '{"chest_max_cm": 140, "length_max_cm": 145}'),
  ('checkout_confirmation_text', '"Pastikan pesanan sudah benar. Setelah DP dibayar, pesanan tidak bisa diubah atau dibatalkan."'),
  ('invoice_header', '{"name": "Aurora Hijab", "address": "Semarang", "logo_path": null}'),
  ('notification_recipients', '[]'),
  ('order_terms_text', '""');

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on audit_logs (created_at desc);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references users (id) on delete cascade,
  kind text not null check (kind in ('ORDER_PLACED', 'ORDER_CANCELLED', 'PAYMENT_SUBMITTED')),
  payload jsonb not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on notifications (recipient_id, created_at desc);

create table document_counters (
  kind text not null,
  year int not null,
  last_value int not null,
  primary key (kind, year)
);

create type order_status as enum (
  'AWAITING_DP', 'DP_UNDER_REVIEW', 'DP_RECEIVED', 'IN_PRODUCTION',
  'AWAITING_SETTLEMENT', 'SETTLED', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'EXPIRED'
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  agent_id uuid not null references agents (user_id),
  po_batch_id uuid not null references po_batches (id),
  status order_status not null default 'AWAITING_DP',
  subtotal bigint not null check (subtotal > 0),
  dp_amount bigint not null check (dp_amount > 0),
  settlement_amount bigint not null check (settlement_amount >= 0),
  dp_due_at timestamptz not null,
  dp_received_at timestamptz,
  eta_at timestamptz,
  settled_at timestamptz,
  shipped_at timestamptz,
  checkout_idempotency_key text unique not null,
  created_at timestamptz not null default now(),
  check (dp_amount + settlement_amount = subtotal)
);

create index orders_agent_idx on orders (agent_id, created_at desc);
create index orders_status_due_idx on orders (status, dp_due_at);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  product_name text not null,
  color_name text not null,
  size_code text,
  custom_chest_cm numeric(4, 1),
  custom_length_cm numeric(4, 1),
  qty int not null check (qty > 0),
  unit_price bigint not null check (unit_price > 0),
  line_total bigint not null,
  check (line_total = unit_price * qty),
  check ((variant_id is not null) <> (custom_chest_cm is not null))
);

create index order_items_order_idx on order_items (order_id);

create unique index cart_items_variant_unique on cart_items (cart_id, po_batch_id, variant_id) where variant_id is not null;

alter table app_settings enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table document_counters enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

revoke insert, update, delete, truncate on orders, order_items, carts, cart_items from service_role;

create function setting(p_key text) returns jsonb
language sql
stable
set search_path = public
as $$
  select value from app_settings where key = p_key;
$$;

create function order_transition_allowed(p_from order_status, p_to order_status) returns boolean
language sql
immutable
set search_path = public
as $$
  select (p_from, p_to) in (
    ('AWAITING_DP'::order_status, 'CANCELLED'::order_status),
    ('AWAITING_DP', 'EXPIRED'),
    ('AWAITING_DP', 'DP_UNDER_REVIEW'),
    ('DP_UNDER_REVIEW', 'AWAITING_DP'),
    ('DP_UNDER_REVIEW', 'DP_RECEIVED'),
    ('DP_RECEIVED', 'IN_PRODUCTION'),
    ('IN_PRODUCTION', 'AWAITING_SETTLEMENT'),
    ('AWAITING_SETTLEMENT', 'SETTLED'),
    ('SETTLED', 'SHIPPED'),
    ('SHIPPED', 'COMPLETED')
  );
$$;

create function orders_enforce_status() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status <> 'AWAITING_DP' then
    raise exception 'INVALID_STATUS_TRANSITION' using detail = format('new orders must start as AWAITING_DP, got %s', new.status);
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status and not order_transition_allowed(old.status, new.status) then
    raise exception 'INVALID_STATUS_TRANSITION' using detail = format('%s -> %s is not allowed', old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger orders_enforce_status
before insert or update of status on orders
for each row execute function orders_enforce_status();

create function write_audit(
  p_actor_id uuid,
  p_action text,
  p_entity text,
  p_entity_id uuid,
  p_before jsonb,
  p_after jsonb
) returns void
language sql
set search_path = public
as $$
  insert into audit_logs (actor_id, action, entity, entity_id, before, after)
  values (p_actor_id, p_action, p_entity, p_entity_id, p_before, p_after);
$$;

create function notify_admins(p_kind text, p_payload jsonb) returns void
language sql
set search_path = public
as $$
  insert into notifications (recipient_id, kind, payload)
  select u.id, p_kind, p_payload
  from users u
  where u.role = 'admin'
    and u.is_active
    and (
      jsonb_array_length(coalesce(setting('notification_recipients'), '[]')) = 0
      or u.id::text in (select jsonb_array_elements_text(setting('notification_recipients')))
    );
$$;

create function next_document_number(p_prefix text) returns text
language plpgsql
set search_path = public
as $$
declare
  current_year int := extract(year from now() at time zone 'Asia/Jakarta')::int;
  next_value int;
begin
  insert into document_counters (kind, year, last_value)
  values (p_prefix, current_year, 1)
  on conflict (kind, year) do update set last_value = document_counters.last_value + 1
  returning last_value into next_value;
  return format('%s-%s-%s', p_prefix, current_year, lpad(next_value::text, 6, '0'));
end;
$$;

create function assert_active_role(p_actor_id uuid, p_role app_role) returns void
language plpgsql
stable
set search_path = public
as $$
begin
  if not exists (select 1 from users where id = p_actor_id and role = p_role and is_active) then
    raise exception 'FORBIDDEN' using detail = format('actor %s is not an active %s', p_actor_id, p_role);
  end if;
end;
$$;

create function agent_payload(p_agent_id uuid) returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object('agent_id', u.id, 'agent_name', u.full_name, 'agent_code', a.code)
  from users u join agents a on a.user_id = u.id
  where u.id = p_agent_id;
$$;

create function dp_amount_for(p_subtotal bigint) returns bigint
language sql
stable
set search_path = public
as $$
  select (p_subtotal * setting('dp_percent')::bigint + 99) / 100;
$$;

create function cart_upsert_item(
  p_actor_id uuid,
  p_po_batch_id uuid,
  p_qty int,
  p_variant_id uuid default null,
  p_custom_color_id uuid default null,
  p_custom_chest_cm numeric default null,
  p_custom_length_cm numeric default null,
  p_cart_item_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  batch_product_id uuid;
  agent_cart_id uuid;
  item_id uuid;
  limits jsonb := setting('custom_size_limits');
begin
  perform assert_active_role(p_actor_id, 'agent');

  select b.product_id into batch_product_id
  from po_batches b join products p on p.id = b.product_id
  where b.id = p_po_batch_id and b.status = 'open' and p.status = 'active';
  if batch_product_id is null then
    raise exception 'BATCH_NOT_OPEN';
  end if;

  insert into carts (agent_id) values (p_actor_id)
  on conflict (agent_id) do update set updated_at = now()
  returning id into agent_cart_id;

  if p_variant_id is not null then
    if p_qty is null or p_qty < 0 then
      raise exception 'INVALID_QTY';
    end if;
    if not exists (select 1 from product_variants where id = p_variant_id and product_id = batch_product_id and is_active) then
      raise exception 'VARIANT_NOT_AVAILABLE';
    end if;
    if p_qty = 0 then
      delete from cart_items
      where cart_id = agent_cart_id and po_batch_id = p_po_batch_id and variant_id = p_variant_id
      returning id into item_id;
    else
      insert into cart_items (cart_id, po_batch_id, product_id, variant_id, qty)
      values (agent_cart_id, p_po_batch_id, batch_product_id, p_variant_id, p_qty)
      on conflict (cart_id, po_batch_id, variant_id) where variant_id is not null
      do update set qty = excluded.qty
      returning id into item_id;
    end if;
  else
    if p_qty is null or p_qty <= 0 then
      raise exception 'INVALID_QTY';
    end if;
    if not exists (select 1 from products where id = batch_product_id and custom_size_enabled) then
      raise exception 'CUSTOM_SIZE_NOT_AVAILABLE';
    end if;
    if not exists (select 1 from product_colors where id = p_custom_color_id and product_id = batch_product_id) then
      raise exception 'COLOR_NOT_AVAILABLE';
    end if;
    if p_custom_chest_cm is null or p_custom_length_cm is null
      or p_custom_chest_cm <= 0 or p_custom_chest_cm > (limits ->> 'chest_max_cm')::numeric
      or p_custom_length_cm <= 0 or p_custom_length_cm > (limits ->> 'length_max_cm')::numeric then
      raise exception 'CUSTOM_SIZE_OUT_OF_RANGE';
    end if;
    if p_cart_item_id is not null then
      update cart_items
      set po_batch_id = p_po_batch_id,
          product_id = batch_product_id,
          qty = p_qty,
          custom_color_id = p_custom_color_id,
          custom_chest_cm = p_custom_chest_cm,
          custom_length_cm = p_custom_length_cm
      where id = p_cart_item_id and cart_id = agent_cart_id and variant_id is null
      returning id into item_id;
      if item_id is null then
        raise exception 'CART_ITEM_NOT_FOUND';
      end if;
    else
      insert into cart_items (cart_id, po_batch_id, product_id, qty, custom_color_id, custom_chest_cm, custom_length_cm)
      values (agent_cart_id, p_po_batch_id, batch_product_id, p_qty, p_custom_color_id, p_custom_chest_cm, p_custom_length_cm)
      returning id into item_id;
    end if;
  end if;

  perform write_audit(
    p_actor_id, 'cart_upsert_item', 'cart_item', item_id, null,
    jsonb_build_object('po_batch_id', p_po_batch_id, 'variant_id', p_variant_id, 'qty', p_qty,
                       'custom_chest_cm', p_custom_chest_cm, 'custom_length_cm', p_custom_length_cm)
  );
  return item_id;
end;
$$;

create function cart_remove_item(p_actor_id uuid, p_cart_item_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  removed jsonb;
begin
  perform assert_active_role(p_actor_id, 'agent');
  delete from cart_items ci
  using carts c
  where ci.id = p_cart_item_id and c.id = ci.cart_id and c.agent_id = p_actor_id
  returning to_jsonb(ci) into removed;
  if removed is null then
    raise exception 'CART_ITEM_NOT_FOUND';
  end if;
  update carts set updated_at = now() where agent_id = p_actor_id;
  perform write_audit(p_actor_id, 'cart_remove_item', 'cart_item', p_cart_item_id, removed, null);
end;
$$;

create function cart_clear(p_actor_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  agent_cart_id uuid;
begin
  perform assert_active_role(p_actor_id, 'agent');
  select id into agent_cart_id from carts where agent_id = p_actor_id;
  if agent_cart_id is null then
    return;
  end if;
  delete from cart_items where cart_id = agent_cart_id;
  update carts set updated_at = now() where id = agent_cart_id;
  perform write_audit(p_actor_id, 'cart_clear', 'cart', agent_cart_id, null, null);
end;
$$;

create function checkout_cart(p_actor_id uuid, p_idempotency_key uuid)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  agent_cart_id uuid;
  line_count int;
  is_all_orderable boolean;
  batch record;
  new_order orders;
  deposit bigint;
begin
  perform assert_active_role(p_actor_id, 'agent');

  select id into agent_cart_id from carts where agent_id = p_actor_id for update;

  if exists (
    select 1 from orders o
    where o.agent_id = p_actor_id and o.checkout_idempotency_key like p_idempotency_key::text || ':%'
  ) then
    return query
      select o.id, o.number from orders o
      where o.agent_id = p_actor_id and o.checkout_idempotency_key like p_idempotency_key::text || ':%'
      order by o.number;
    return;
  end if;

  if agent_cart_id is null then
    raise exception 'CART_EMPTY';
  end if;

  select count(*), coalesce(bool_and(q.is_orderable), false)
  into line_count, is_all_orderable
  from price_quote(agent_cart_id) q;
  if line_count = 0 then
    raise exception 'CART_EMPTY';
  end if;
  if not is_all_orderable then
    raise exception 'CART_HAS_UNAVAILABLE_ITEMS';
  end if;

  for batch in
    select q.po_batch_id, sum(q.line_total)::bigint as subtotal
    from price_quote(agent_cart_id) q
    group by q.po_batch_id
    order by min(q.batch_label), min(q.product_name)
  loop
    deposit := dp_amount_for(batch.subtotal);

    insert into orders (number, agent_id, po_batch_id, subtotal, dp_amount, settlement_amount, dp_due_at, checkout_idempotency_key)
    values (
      next_document_number('AUR'),
      p_actor_id,
      batch.po_batch_id,
      batch.subtotal,
      deposit,
      batch.subtotal - deposit,
      now() + make_interval(hours => setting('dp_window_hours')::int),
      p_idempotency_key::text || ':' || batch.po_batch_id::text
    )
    returning * into new_order;

    insert into order_items (order_id, product_id, variant_id, product_name, color_name, size_code,
                             custom_chest_cm, custom_length_cm, qty, unit_price, line_total)
    select new_order.id, q.product_id, q.variant_id, q.product_name, q.color_name, q.size_code,
           q.custom_chest_cm, q.custom_length_cm, q.qty, q.unit_price, q.line_total
    from price_quote(agent_cart_id) q
    where q.po_batch_id = batch.po_batch_id;

    perform notify_admins(
      'ORDER_PLACED',
      agent_payload(p_actor_id) || jsonb_build_object(
        'order_id', new_order.id, 'order_number', new_order.number, 'subtotal', new_order.subtotal
      )
    );
    perform write_audit(p_actor_id, 'checkout', 'order', new_order.id, null, to_jsonb(new_order));

    order_id := new_order.id;
    order_number := new_order.number;
    return next;
  end loop;

  delete from cart_items where cart_id = agent_cart_id;
  update carts set updated_at = now() where id = agent_cart_id;
end;
$$;

create function cancel_order(p_actor_id uuid, p_order_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target orders;
begin
  perform assert_active_role(p_actor_id, 'agent');

  select * into target from orders where id = p_order_id and agent_id = p_actor_id for update;
  if target.id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if target.status <> 'AWAITING_DP' then
    raise exception 'ORDER_NOT_CANCELLABLE' using detail = format('status is %s', target.status);
  end if;

  update orders set status = 'CANCELLED' where id = p_order_id;

  perform notify_admins(
    'ORDER_CANCELLED',
    agent_payload(p_actor_id) || jsonb_build_object('order_id', target.id, 'order_number', target.number)
  );
  perform write_audit(p_actor_id, 'cancel_order', 'order', target.id,
                      jsonb_build_object('status', target.status), jsonb_build_object('status', 'CANCELLED'));
end;
$$;
