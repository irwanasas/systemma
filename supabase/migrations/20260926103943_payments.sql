create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  purpose text not null check (purpose in ('DP', 'SETTLEMENT')),
  method text not null default 'TRANSFER' check (method in ('TRANSFER')),
  amount bigint not null check (amount > 0),
  proof_path text,
  status text not null default 'PENDING' check (status in ('PENDING', 'VERIFIED', 'REJECTED')),
  reject_reason text,
  verified_by uuid references users (id),
  verified_at timestamptz,
  idempotency_key text unique not null,
  created_at timestamptz not null default now(),
  check (purpose <> 'DP' or proof_path is not null),
  check (status <> 'REJECTED' or reject_reason is not null)
);

create index payments_order_idx on payments (order_id, created_at desc);
create index payments_pending_idx on payments (created_at) where status = 'PENDING';

create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references orders (id) on delete cascade,
  number text unique not null,
  issued_at timestamptz not null default now(),
  settled_at timestamptz
);

alter table payments enable row level security;
alter table invoices enable row level security;

revoke insert, update, delete, truncate on payments, invoices from service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

create function submit_dp_proof(
  p_actor_id uuid,
  p_order_id uuid,
  p_proof_path text,
  p_amount bigint,
  p_idempotency_key uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target orders;
  existing payments;
  new_payment payments;
begin
  perform assert_active_role(p_actor_id, 'agent');

  select * into target from orders where id = p_order_id and agent_id = p_actor_id for update;
  if target.id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  select * into existing from payments where idempotency_key = p_idempotency_key::text;
  if existing.id is not null then
    if existing.order_id <> p_order_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return existing.id;
  end if;

  if target.status <> 'AWAITING_DP' then
    raise exception 'ORDER_NOT_AWAITING_DP' using detail = format('status is %s', target.status);
  end if;
  if target.dp_due_at <= now() then
    raise exception 'DP_DEADLINE_PASSED';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;
  if p_proof_path is null or p_proof_path not like p_actor_id::text || '/' || p_order_id::text || '/%' then
    raise exception 'INVALID_PROOF_PATH';
  end if;

  insert into payments (order_id, purpose, amount, proof_path, idempotency_key)
  values (p_order_id, 'DP', p_amount, p_proof_path, p_idempotency_key::text)
  returning * into new_payment;

  update orders set status = 'DP_UNDER_REVIEW' where id = p_order_id;

  perform notify_admins(
    'PAYMENT_SUBMITTED',
    agent_payload(p_actor_id) || jsonb_build_object(
      'order_id', target.id, 'order_number', target.number, 'payment_id', new_payment.id,
      'amount', p_amount, 'expected_amount', target.dp_amount
    )
  );
  perform write_audit(p_actor_id, 'submit_dp_proof', 'payment', new_payment.id, null, to_jsonb(new_payment));
  return new_payment.id;
end;
$$;

create function review_dp(p_actor_id uuid, p_payment_id uuid, p_approve boolean, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  payment payments;
  target orders;
  batch_eta_days int;
  reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  perform assert_active_role(p_actor_id, 'admin');

  select * into payment from payments where id = p_payment_id and purpose = 'DP' for update;
  if payment.id is null then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  if payment.status <> 'PENDING' then
    if (p_approve and payment.status = 'VERIFIED') or (not p_approve and payment.status = 'REJECTED') then
      return;
    end if;
    raise exception 'PAYMENT_ALREADY_REVIEWED';
  end if;

  select * into target from orders where id = payment.order_id for update;
  if target.status <> 'DP_UNDER_REVIEW' then
    raise exception 'INVALID_STATUS_TRANSITION' using detail = format('order status is %s', target.status);
  end if;

  if p_approve then
    select eta_days into batch_eta_days from po_batches where id = target.po_batch_id;
    update payments set status = 'VERIFIED', verified_by = p_actor_id, verified_at = now() where id = payment.id;
    update orders
    set status = 'DP_RECEIVED',
        dp_received_at = now(),
        eta_at = now() + make_interval(days => batch_eta_days)
    where id = target.id;
    insert into invoices (order_id, number) values (target.id, next_document_number('INV'));
    perform write_audit(p_actor_id, 'approve_dp', 'payment', payment.id,
                        jsonb_build_object('status', 'PENDING'), jsonb_build_object('status', 'VERIFIED'));
  else
    if reason is null then
      raise exception 'REJECT_REASON_REQUIRED';
    end if;
    update payments
    set status = 'REJECTED', reject_reason = reason, verified_by = p_actor_id, verified_at = now()
    where id = payment.id;
    update orders
    set status = 'AWAITING_DP',
        dp_due_at = now() + make_interval(hours => setting('dp_window_hours')::int)
    where id = target.id;
    perform write_audit(p_actor_id, 'reject_dp', 'payment', payment.id,
                        jsonb_build_object('status', 'PENDING'),
                        jsonb_build_object('status', 'REJECTED', 'reason', reason));
  end if;
end;
$$;

create function order_transition(p_actor_id uuid, p_order_id uuid, p_to_status order_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target orders;
begin
  perform assert_active_role(p_actor_id, 'admin');

  select * into target from orders where id = p_order_id for update;
  if target.id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if target.status = p_to_status then
    return;
  end if;
  if (target.status, p_to_status) not in (
    ('DP_RECEIVED'::order_status, 'IN_PRODUCTION'::order_status),
    ('IN_PRODUCTION', 'AWAITING_SETTLEMENT'),
    ('SETTLED', 'SHIPPED'),
    ('SHIPPED', 'COMPLETED')
  ) then
    raise exception 'INVALID_STATUS_TRANSITION' using detail = format('%s -> %s', target.status, p_to_status);
  end if;

  update orders
  set status = p_to_status,
      shipped_at = case when p_to_status = 'SHIPPED' then now() else shipped_at end
  where id = p_order_id;

  perform write_audit(p_actor_id, 'order_transition', 'order', p_order_id,
                      jsonb_build_object('status', target.status), jsonb_build_object('status', p_to_status));
end;
$$;

create function mark_settled(p_actor_id uuid, p_order_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target orders;
begin
  perform assert_active_role(p_actor_id, 'admin');

  select * into target from orders where id = p_order_id for update;
  if target.id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if exists (select 1 from payments where order_id = p_order_id and purpose = 'SETTLEMENT' and status = 'VERIFIED') then
    return;
  end if;
  if target.status <> 'AWAITING_SETTLEMENT' then
    raise exception 'INVALID_STATUS_TRANSITION' using detail = format('order status is %s', target.status);
  end if;

  insert into payments (order_id, purpose, amount, status, verified_by, verified_at, idempotency_key)
  values (p_order_id, 'SETTLEMENT', greatest(target.settlement_amount, 1), 'VERIFIED', p_actor_id, now(),
          'settlement:' || p_order_id::text);
  update orders set status = 'SETTLED', settled_at = now() where id = p_order_id;
  update invoices set settled_at = now() where order_id = p_order_id;

  perform write_audit(p_actor_id, 'mark_settled', 'order', p_order_id,
                      jsonb_build_object('status', target.status), jsonb_build_object('status', 'SETTLED'));
end;
$$;

create function expire_unpaid_orders() returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count int;
begin
  with expired as (
    update orders o
    set status = 'EXPIRED'
    where o.status = 'AWAITING_DP'
      and o.dp_due_at <= now()
      and not exists (select 1 from payments p where p.order_id = o.id and p.status = 'PENDING')
    returning o.id
  ),
  audited as (
    insert into audit_logs (actor_id, action, entity, entity_id, before, after)
    select null, 'expire_order', 'order', id, '{"status": "AWAITING_DP"}', '{"status": "EXPIRED"}' from expired
    returning 1
  )
  select count(*) into expired_count from audited;
  return expired_count;
end;
$$;

create extension if not exists pg_cron;

select cron.schedule('expire-unpaid-orders', '*/5 * * * *', 'select public.expire_unpaid_orders()');
