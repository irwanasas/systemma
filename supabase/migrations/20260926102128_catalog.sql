create table categories (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code in ('dress', 'koko', 'khimar_voal')),
  name text not null
);

insert into categories (code, name) values
  ('dress', 'Dress'),
  ('koko', 'Koko'),
  ('khimar_voal', 'Khimar + Voal');

create table sizes (
  code text primary key check (code in ('S', 'M', 'L', 'XL', 'XXL')),
  sort int not null unique
);

insert into sizes (code, sort) values ('S', 1), ('M', 2), ('L', 3), ('XL', 4), ('XXL', 5);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  category_id uuid not null references categories (id),
  description text,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  custom_size_enabled boolean not null default false,
  custom_unit_price bigint check (custom_unit_price > 0),
  created_at timestamptz not null default now(),
  check (not custom_size_enabled or custom_unit_price is not null)
);

create table product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  name text not null check (name ~ '[a-zA-Z0-9]'),
  hex text check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  sort int not null default 0
);

create unique index product_colors_unique_code on product_colors (product_id, upper(regexp_replace(name, '[^a-zA-Z0-9]', '', 'g')));

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  color_id uuid references product_colors (id) on delete cascade,
  path text not null,
  sort int not null default 0
);

create table size_prices (
  product_id uuid not null references products (id) on delete cascade,
  size_code text not null references sizes (code),
  unit_price bigint not null check (unit_price > 0),
  primary key (product_id, size_code)
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  color_id uuid not null references product_colors (id) on delete cascade,
  size_code text not null references sizes (code),
  sku text unique not null,
  is_active boolean not null default true,
  unique (product_id, color_id, size_code)
);

create table po_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  batch_no int not null check (batch_no > 0),
  label text not null,
  opens_at timestamptz,
  closes_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'open', 'closed')),
  eta_days int not null default 40 check (eta_days > 0),
  unique (product_id, batch_no),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create unique index po_batches_one_open_per_product on po_batches (product_id) where status = 'open';

create table carts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid unique not null references agents (user_id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts (id) on delete cascade,
  po_batch_id uuid not null references po_batches (id),
  product_id uuid not null references products (id),
  variant_id uuid references product_variants (id),
  qty int not null check (qty > 0),
  custom_color_id uuid references product_colors (id),
  custom_chest_cm numeric(4, 1) check (custom_chest_cm > 0 and custom_chest_cm <= 140),
  custom_length_cm numeric(4, 1) check (custom_length_cm > 0 and custom_length_cm <= 145),
  created_at timestamptz not null default now(),
  check ((variant_id is not null) <> (custom_chest_cm is not null)),
  check ((custom_chest_cm is null) = (custom_length_cm is null)),
  check ((custom_chest_cm is null) = (custom_color_id is null))
);

create index cart_items_cart_id_idx on cart_items (cart_id);

alter table categories enable row level security;
alter table sizes enable row level security;
alter table products enable row level security;
alter table product_colors enable row level security;
alter table product_images enable row level security;
alter table size_prices enable row level security;
alter table product_variants enable row level security;
alter table po_batches enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;

create function sync_product_variants(p_product_id uuid) returns void
language sql
set search_path = public
as $$
  insert into product_variants (product_id, color_id, size_code, sku, is_active)
  select
    c.product_id,
    c.id,
    s.code,
    upper(p.slug) || '-' || upper(regexp_replace(c.name, '[^a-zA-Z0-9]', '', 'g')) || '-' || s.code,
    sp.unit_price is not null
  from product_colors c
  join products p on p.id = c.product_id
  cross join sizes s
  left join size_prices sp on sp.product_id = c.product_id and sp.size_code = s.code
  where c.product_id = p_product_id
  on conflict (product_id, color_id, size_code) do update set is_active = excluded.is_active;
$$;

create function sync_product_variants_trigger() returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform sync_product_variants(coalesce(new.product_id, old.product_id));
  return null;
end;
$$;

create trigger product_colors_sync_variants
after insert on product_colors
for each row execute function sync_product_variants_trigger();

create trigger size_prices_sync_variants
after insert or update or delete on size_prices
for each row execute function sync_product_variants_trigger();

create function price_quote(p_cart_id uuid)
returns table (
  cart_item_id uuid,
  po_batch_id uuid,
  batch_label text,
  product_id uuid,
  product_name text,
  variant_id uuid,
  color_name text,
  size_code text,
  custom_chest_cm numeric,
  custom_length_cm numeric,
  qty int,
  unit_price bigint,
  line_total bigint,
  is_orderable boolean
)
language sql
stable
set search_path = public
as $$
  select
    ci.id,
    ci.po_batch_id,
    b.label,
    ci.product_id,
    p.name,
    ci.variant_id,
    c.name,
    v.size_code,
    ci.custom_chest_cm,
    ci.custom_length_cm,
    ci.qty,
    price.unit_price,
    price.unit_price * ci.qty,
    coalesce(
      p.status = 'active'
      and b.status = 'open'
      and b.product_id = ci.product_id
      and c.product_id = ci.product_id
      and price.unit_price is not null
      and (ci.variant_id is null or (v.is_active and v.product_id = ci.product_id)),
      false
    )
  from cart_items ci
  join products p on p.id = ci.product_id
  join po_batches b on b.id = ci.po_batch_id
  left join product_variants v on v.id = ci.variant_id
  left join product_colors c on c.id = coalesce(v.color_id, ci.custom_color_id)
  left join sizes s on s.code = v.size_code
  left join size_prices sp on sp.product_id = ci.product_id and sp.size_code = v.size_code
  cross join lateral (
    select case
      when ci.variant_id is not null then sp.unit_price
      when p.custom_size_enabled then p.custom_unit_price
    end as unit_price
  ) price
  where ci.cart_id = p_cart_id
  order by b.label, p.name, c.sort, c.name, s.sort nulls last, ci.created_at;
$$;
