begin;
select plan(5);

select isnt(
  create_agent('t-agent', 'hash', 'Tes Agen', 'T001'),
  null,
  'create_agent returns the new user id'
);

select results_eq(
  $$ select u.role::text, a.code from users u join agents a on a.user_id = u.id where u.username = 't-agent' $$,
  $$ values ('agent', 'T001') $$,
  'user and agent rows are created together'
);

select throws_ok(
  $$ select create_agent('t-agent-2', 'hash', 'Tes Dua', 'T001') $$,
  '23505',
  null,
  'duplicate agent code is rejected'
);

select is_empty(
  $$ select 1 from users where username = 't-agent-2' $$,
  'no orphan user is left when the agent insert fails'
);

select function_privs_are(
  'public', 'create_agent', array['citext','text','text','text','text','text','text'], 'anon', array[]::text[],
  'anon cannot execute create_agent'
);

select * from finish();
rollback;
