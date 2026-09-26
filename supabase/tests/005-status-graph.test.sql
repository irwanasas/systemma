begin;
select plan(39);

select set_eq(
  $$ select f::text, t::text from unnest(enum_range(null::order_status)) f, unnest(enum_range(null::order_status)) t
     where order_transition_allowed(f, t) $$,
  $$ values ('AWAITING_DP', 'CANCELLED'), ('AWAITING_DP', 'EXPIRED'), ('AWAITING_DP', 'DP_UNDER_REVIEW'),
            ('DP_UNDER_REVIEW', 'AWAITING_DP'), ('DP_UNDER_REVIEW', 'DP_RECEIVED'), ('DP_RECEIVED', 'IN_PRODUCTION'),
            ('IN_PRODUCTION', 'AWAITING_SETTLEMENT'), ('AWAITING_SETTLEMENT', 'SETTLED'), ('SETTLED', 'SHIPPED'),
            ('SHIPPED', 'COMPLETED') $$,
  'exactly the ten edges of the status graph are allowed'
);

select is_empty(
  $$ select f from unnest(enum_range(null::order_status)) f
     where f in ('DP_RECEIVED', 'IN_PRODUCTION', 'AWAITING_SETTLEMENT', 'SETTLED', 'SHIPPED', 'COMPLETED')
       and order_transition_allowed(f, 'CANCELLED') $$,
  'nothing from DP_RECEIVED onwards can become CANCELLED'
);

insert into users (id, username, password_hash, role, full_name) values
  ('00000000-0000-0000-0000-00000000a001', 't-agent', 'x', 'agent', 'Tes Agen'),
  ('00000000-0000-0000-0000-00000000a002', 't-other', 'x', 'agent', 'Agen Lain'),
  ('00000000-0000-0000-0000-00000000a003', 't-admin', 'x', 'admin', 'Tes Admin');
insert into agents (user_id, code) values
  ('00000000-0000-0000-0000-00000000a001', 'T001'),
  ('00000000-0000-0000-0000-00000000a002', 'T002');
insert into products (id, slug, name, category_id, status)
select '00000000-0000-0000-0000-00000000b001', 't-zelline', 'Zelline', id, 'active' from categories where code = 'dress';
insert into product_colors (id, product_id, name) values ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b001', 'Hitam');
insert into size_prices (product_id, size_code, unit_price) values ('00000000-0000-0000-0000-00000000b001', 'M', 200000);
insert into po_batches (id, product_id, batch_no, label, status, eta_days)
values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000b001', 1, 'B1', 'open', 30);

create temp table ctx (order_id uuid, second_order_id uuid, payment_id uuid, second_payment_id uuid);

select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 4,
  (select id from product_variants where size_code = 'M' and product_id = '00000000-0000-0000-0000-00000000b001'));
insert into ctx (order_id) select order_id from checkout_cart('00000000-0000-0000-0000-00000000a001', gen_random_uuid());

select cart_upsert_item('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 1,
  (select id from product_variants where size_code = 'M' and product_id = '00000000-0000-0000-0000-00000000b001'));
update ctx set second_order_id = (select order_id from checkout_cart('00000000-0000-0000-0000-00000000a001', gen_random_uuid()));

select throws_ok(
  $$ update orders set status = 'IN_PRODUCTION' where id = (select order_id from ctx) $$,
  'INVALID_STATUS_TRANSITION',
  'the trigger rejects a direct jump from AWAITING_DP to IN_PRODUCTION'
);
select throws_ok(
  $$ select submit_dp_proof('00000000-0000-0000-0000-00000000a002', (select order_id from ctx),
       '00000000-0000-0000-0000-00000000a002/x/proof.jpg', 200000, gen_random_uuid()) $$,
  'ORDER_NOT_FOUND',
  'another agent cannot submit proof for this order'
);
select throws_ok(
  format($$ select submit_dp_proof('00000000-0000-0000-0000-00000000a001', %L, 'someone-else/proof.jpg', 200000, gen_random_uuid()) $$,
         (select order_id from ctx)),
  'INVALID_PROOF_PATH',
  'the proof must be stored under the agent and order folder'
);

update ctx set payment_id = submit_dp_proof(
  '00000000-0000-0000-0000-00000000a001', order_id,
  '00000000-0000-0000-0000-00000000a001/' || order_id || '/first.jpg', 200000, '33333333-3333-3333-3333-333333333333');

select is((select status::text from orders where id = (select order_id from ctx)), 'DP_UNDER_REVIEW', 'proof moves the order to DP_UNDER_REVIEW');
select is(
  submit_dp_proof('00000000-0000-0000-0000-00000000a001', (select order_id from ctx),
    '00000000-0000-0000-0000-00000000a001/' || (select order_id from ctx) || '/again.jpg', 200000, '33333333-3333-3333-3333-333333333333'),
  (select payment_id from ctx),
  'submitting with the same idempotency key returns the same payment'
);
select is((select count(*)::int from payments where order_id = (select order_id from ctx)), 1, 'no duplicate payment is created');
select is(
  (select count(*)::int from notifications where kind = 'PAYMENT_SUBMITTED' and payload ->> 'order_id' = (select order_id::text from ctx)),
  (select count(*)::int from users where role = 'admin' and is_active),
  'admins are notified that proof was submitted'
);
select throws_ok(
  format($$ select cancel_order('00000000-0000-0000-0000-00000000a001', %L) $$, (select order_id from ctx)),
  'ORDER_NOT_CANCELLABLE',
  'the agent cannot cancel once proof is submitted'
);

update orders set dp_due_at = now() - interval '1 hour' where id = (select order_id from ctx);
select is(expire_unpaid_orders() >= 0, true, 'expiry runs');
select is((select status::text from orders where id = (select order_id from ctx)), 'DP_UNDER_REVIEW', 'an order with proof under review is safe from expiry');

select throws_ok(
  format($$ select review_dp('00000000-0000-0000-0000-00000000a001', %L, true) $$, (select payment_id from ctx)),
  'FORBIDDEN',
  'agents cannot review payments'
);
select throws_ok(
  format($$ select review_dp('00000000-0000-0000-0000-00000000a003', %L, false, '  ') $$, (select payment_id from ctx)),
  'REJECT_REASON_REQUIRED',
  'rejecting requires a reason'
);
select lives_ok(
  format($$ select review_dp('00000000-0000-0000-0000-00000000a003', %L, false, 'Nominal tidak terbaca') $$, (select payment_id from ctx)),
  'admin rejects the proof with a reason'
);
select ok(
  (select status = 'AWAITING_DP' and dp_due_at > now() + interval '23 hours' from orders where id = (select order_id from ctx)),
  'rejection returns the order to AWAITING_DP with a fresh 24h window'
);
select is((select reject_reason from payments where id = (select payment_id from ctx)), 'Nominal tidak terbaca', 'the reason is stored');

update ctx set second_payment_id = submit_dp_proof(
  '00000000-0000-0000-0000-00000000a001', order_id,
  '00000000-0000-0000-0000-00000000a001/' || order_id || '/second.jpg', 200000, gen_random_uuid());

select throws_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'IN_PRODUCTION') $$, (select order_id from ctx)),
  'INVALID_STATUS_TRANSITION',
  'production cannot start before the DP is approved'
);
select lives_ok(
  format($$ select review_dp('00000000-0000-0000-0000-00000000a003', %L, true) $$, (select second_payment_id from ctx)),
  'admin approves the second proof'
);
select lives_ok(
  format($$ select review_dp('00000000-0000-0000-0000-00000000a003', %L, true) $$, (select second_payment_id from ctx)),
  'approving again is a no-op'
);
select ok(
  (select status = 'DP_RECEIVED' and dp_received_at is not null
     and eta_at between dp_received_at + interval '30 days' - interval '1 second' and dp_received_at + interval '30 days' + interval '1 second'
   from orders where id = (select order_id from ctx)),
  'approval sets DP_RECEIVED and ETA = approval + batch eta_days'
);
select ok(
  (select number ~ '^INV-\d{4}-\d{6}$' and settled_at is null from invoices where order_id = (select order_id from ctx)),
  'approval issues an invoice'
);
select throws_ok(
  format($$ select cancel_order('00000000-0000-0000-0000-00000000a001', %L) $$, (select order_id from ctx)),
  'ORDER_NOT_CANCELLABLE',
  'the order is locked after DP'
);
select throws_ok(
  $$ update orders set status = 'CANCELLED' where id = (select order_id from ctx) $$,
  'INVALID_STATUS_TRANSITION',
  'even a direct update cannot cancel after DP'
);
select throws_ok(
  format($$ select mark_settled('00000000-0000-0000-0000-00000000a003', %L) $$, (select order_id from ctx)),
  'INVALID_STATUS_TRANSITION',
  'settlement is not possible before AWAITING_SETTLEMENT'
);
select throws_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'SHIPPED') $$, (select order_id from ctx)),
  'INVALID_STATUS_TRANSITION',
  'shipping cannot skip production and settlement'
);
select lives_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'IN_PRODUCTION') $$, (select order_id from ctx)),
  'DP_RECEIVED → IN_PRODUCTION'
);
select lives_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'AWAITING_SETTLEMENT') $$, (select order_id from ctx)),
  'IN_PRODUCTION → AWAITING_SETTLEMENT'
);
select throws_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'SETTLED') $$, (select order_id from ctx)),
  'INVALID_STATUS_TRANSITION',
  'SETTLED can only be reached through mark_settled'
);
select throws_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'SHIPPED') $$, (select order_id from ctx)),
  'INVALID_STATUS_TRANSITION',
  'shipping before settlement is rejected'
);
select lives_ok(
  format($$ select mark_settled('00000000-0000-0000-0000-00000000a003', %L) $$, (select order_id from ctx)),
  'admin marks the settlement as paid'
);
select lives_ok(
  format($$ select mark_settled('00000000-0000-0000-0000-00000000a003', %L) $$, (select order_id from ctx)),
  'marking as paid again is a no-op'
);
select results_eq(
  format($$ select count(*)::int, sum(amount)::bigint from payments where order_id = %L and purpose = 'SETTLEMENT' $$, (select order_id from ctx)),
  $$ values (1, 600000::bigint) $$,
  'exactly one verified settlement payment of 75%'
);
select ok(
  (select o.status = 'SETTLED' and o.settled_at is not null and i.settled_at is not null
   from orders o join invoices i on i.order_id = o.id where o.id = (select order_id from ctx)),
  'order and invoice are marked settled'
);
select lives_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'SHIPPED') $$, (select order_id from ctx)),
  'SETTLED → SHIPPED'
);
select lives_ok(
  format($$ select order_transition('00000000-0000-0000-0000-00000000a003', %L, 'COMPLETED') $$, (select order_id from ctx)),
  'SHIPPED → COMPLETED'
);
select ok(
  (select status = 'COMPLETED' and shipped_at is not null from orders where id = (select order_id from ctx)),
  'the order completes with a shipping time'
);

update orders set dp_due_at = now() - interval '1 minute' where id = (select second_order_id from ctx);
select throws_ok(
  format($$ select submit_dp_proof('00000000-0000-0000-0000-00000000a001', %L, %L, 50000, gen_random_uuid()) $$,
         (select second_order_id from ctx),
         '00000000-0000-0000-0000-00000000a001/' || (select second_order_id from ctx) || '/late.jpg'),
  'DP_DEADLINE_PASSED',
  'proof after the 24h deadline is rejected'
);
select expire_unpaid_orders();
select is((select status::text from orders where id = (select second_order_id from ctx)), 'EXPIRED', 'an unpaid order past its deadline expires');

select * from finish();
rollback;
