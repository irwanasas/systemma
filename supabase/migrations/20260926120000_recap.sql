create function recap_by_agent_series(p_from timestamptz, p_to timestamptz)
returns table (
  agent_id uuid,
  agent_code text,
  agent_name text,
  category_code text,
  category_name text,
  product_name text,
  batch_label text,
  order_count int,
  qty int,
  order_value bigint,
  dp_received bigint,
  settlement_received bigint
)
language sql
stable
set search_path = public
as $$
  with order_totals as (
    select o.id, o.agent_id, o.po_batch_id, o.dp_amount, o.settlement_amount, o.dp_received_at, o.settled_at,
           sum(oi.qty) as qty, sum(oi.line_total) as order_value
    from orders o
    join order_items oi on oi.order_id = o.id
    where o.created_at >= p_from
      and o.created_at < p_to
      and o.status not in ('CANCELLED', 'EXPIRED')
    group by o.id
  )
  select
    a.user_id,
    a.code,
    u.full_name,
    c.code,
    c.name,
    p.name,
    b.label,
    count(*)::int,
    sum(t.qty)::int,
    sum(t.order_value)::bigint,
    coalesce(sum(t.dp_amount) filter (where t.dp_received_at is not null), 0)::bigint,
    coalesce(sum(t.settlement_amount) filter (where t.settled_at is not null), 0)::bigint
  from order_totals t
  join agents a on a.user_id = t.agent_id
  join users u on u.id = a.user_id
  join po_batches b on b.id = t.po_batch_id
  join products p on p.id = b.product_id
  join categories c on c.id = p.category_id
  group by a.user_id, a.code, u.full_name, c.code, c.name, p.name, b.label
  order by a.code, c.name, p.name, b.label;
$$;
