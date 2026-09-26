create extension if not exists citext;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
alter default privileges revoke execute on functions from public;

create type app_role as enum ('admin', 'agent');

create table users (
  id uuid primary key default gen_random_uuid(),
  username citext unique not null,
  password_hash text not null,
  role app_role not null,
  full_name text not null,
  phone text,
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create table agents (
  user_id uuid primary key references users (id) on delete cascade,
  code text unique not null,
  business_name text,
  city text
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  user_agent text,
  created_at timestamptz not null default now()
);

create index sessions_user_id_idx on sessions (user_id);

create table login_attempts (
  username citext not null,
  ip inet,
  succeeded boolean not null,
  created_at timestamptz not null default now()
);

create index login_attempts_lookup_idx on login_attempts (username, ip, created_at);

alter table users enable row level security;
alter table agents enable row level security;
alter table sessions enable row level security;
alter table login_attempts enable row level security;

revoke all on users, agents, sessions, login_attempts from anon, authenticated;

create function create_agent(
  p_username citext,
  p_password_hash text,
  p_full_name text,
  p_code text,
  p_phone text default null,
  p_business_name text default null,
  p_city text default null
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  new_user_id uuid;
begin
  insert into users (username, password_hash, role, full_name, phone)
  values (p_username, p_password_hash, 'agent', p_full_name, p_phone)
  returning id into new_user_id;

  insert into agents (user_id, code, business_name, city)
  values (new_user_id, p_code, p_business_name, p_city);

  return new_user_id;
end;
$$;

revoke all on function create_agent from public, anon, authenticated;
