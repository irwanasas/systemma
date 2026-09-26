create function cleanup_auth_records() returns void
language sql
security definer
set search_path = public
as $$
  delete from sessions where expires_at < now() - interval '1 day';
  delete from login_attempts where created_at < now() - interval '30 days';
$$;

select cron.schedule('cleanup-auth-records', '17 3 * * *', 'select public.cleanup_auth_records()');

alter table login_attempts add column id bigint generated always as identity primary key;

create index login_attempts_username_idx on login_attempts (username, created_at);

revoke update, delete, truncate on audit_logs from service_role;
