create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  body text not null check (length(btrim(body)) > 0),
  published_at timestamptz not null default now(),
  author_id uuid not null references users (id)
);

create index announcements_published_idx on announcements (published_at desc);

alter table announcements enable row level security;
