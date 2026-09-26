# Operations

## Environment variables

| Variable | Where | Notes |
|---|---|---|
| `SUPABASE_URL` | Vercel (server) | Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (server only) | Never exposed to the browser; only `lib/supabase/admin.ts` reads it (`server-only`). Rotate in Supabase if leaked, then update Vercel. |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | local only | Optional, for e2e runs in containers with a preinstalled Chromium. |
| `E2E_DATABASE_URL` | local/CI only | Defaults to the local Supabase database. |

The anon key is not used by the app.

## Scheduled jobs (pg_cron)

| Job | Schedule | What |
|---|---|---|
| `expire-unpaid-orders` | every 5 minutes | `AWAITING_DP` orders past `dp_due_at` become `EXPIRED` (audit row with actor "Sistem"). |
| `cleanup-auth-records` | daily 03:17 UTC | Deletes sessions expired for over a day and login attempts older than 30 days. |

Check them with `select jobname, schedule, active from cron.job;` and recent runs with `select * from cron.job_run_details order by start_time desc limit 20;`.

## First admin in production

The seed (`supabase/seed.sql`) creates demo agents and products and is for local use only. For production, create the first admin once in the SQL editor, then log in and change the password (the app forces it):

```sql
with password as (select translate(encode(extensions.gen_random_bytes(12), 'base64'), '+/', 'xy') as value)
insert into users (username, password_hash, role, full_name)
select 'admin', extensions.crypt(value, extensions.gen_salt('bf', 12)), 'admin', 'Admin Aurora' from password
returning username, (select value from password) as initial_password;
```

Save the returned password in a password manager; it is not stored anywhere else. Then fill in Settings → Rekening tujuan transfer before agents check out.

## Backups

What must be backed up:

1. **Postgres** — all orders, payments, invoices, audit log and settings.
2. **Storage bucket `payment-proofs`** — transfer proofs referenced by `payments.proof_path`. Database backups do not include Storage files.

Plan:

- Use a Supabase plan with daily backups; enable Point-in-Time Recovery if losing up to a day of orders is not acceptable.
- Weekly off-platform copy of the database: `supabase db dump --linked -f aurora-$(date +%F).sql` plus `supabase db dump --linked --data-only -f aurora-data-$(date +%F).sql`, stored outside Supabase (encrypted).
- Weekly copy of the proofs bucket through the Storage S3 endpoint (for example `aws s3 sync` with the project's S3 access keys) to encrypted storage.
- Keep at least 8 weekly copies.

Restore drill (do it once before go-live, then every quarter):

1. Create a scratch Supabase project.
2. `psql "$SCRATCH_DB_URL" -f aurora-<date>.sql` (schema) and the data file.
3. Upload the proof copy into a `payment-proofs` bucket.
4. Point a preview deployment at the scratch project and open a few orders, invoices and proofs.
5. Record the time it took in this file.

## Rate limits and abuse controls

- Login and password change: at most 5 failed attempts per username + IP and 20 per username across all IPs in 15 minutes (`login_attempts`). Each attempt is recorded before the password is checked, so a burst of parallel requests cannot slip past the limit. The IP comes from `x-real-ip`/`x-forwarded-for`, which Vercel sets; outside Vercel these headers are client-controlled, so the per-username cap is what holds.
- Sessions: 7 days sliding, with an absolute limit of 30 days after login.
- Checkout, DP proof, settlement and review are idempotent (unique keys), so double clicks and retries do not duplicate orders or payments.
- Proof uploads: 5 MB, JPEG/PNG/WEBP/PDF by content signature, only while the order awaits DP; the bucket enforces the same size and types.
- Server action body limit: 6 MB.
- PDF proofs are opened through download links, so the browser does not render them inline.
- Known gap: if the server dies between uploading a proof and recording the payment, the file stays in the bucket without a payment row. It is harmless (private, unreferenced); clean up by listing the bucket and deleting objects that no `payments.proof_path` points to.

## Security headers

`next.config.ts` sets `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `strict-origin-when-cross-origin`, HSTS, and a restrictive `Permissions-Policy` (camera allowed for proof photos). A full script CSP with nonces is not enabled yet; it needs nonce plumbing through the proxy and was left out to keep pages statically optimizable.

## Incident checklist

- Suspicious payment or settlement: check `audit_logs` for the order (`entity_id`) and the payment row; all status changes and reviews are logged with the admin who did them.
- Bank account changed unexpectedly: `audit_logs` with `entity = 'settings'` shows the before/after values and who changed them.
- Lost admin access: another admin resets the password from Agen (agents) or via SQL for admins (`update users set password_hash = extensions.crypt('<temp>', extensions.gen_salt('bf', 12)), must_change_password = true where username = '<admin>'; delete from sessions where user_id = (select id from users where username = '<admin>');`).
