# 0009 — F8 hardening decisions

Status: accepted

## Decisions

- An independent read-only security review of all pages, server actions, route handlers, SQL functions, session handling, uploads and client bundles found no High issues. Findings fixed in F8:
  - Login and password-change throttling records the attempt before checking the password (no parallel-burst bypass) and adds a per-username cap of 20 failures per 15 minutes across all IPs, next to 5 per username + IP.
  - Sessions have an absolute lifetime of 30 days after login, on top of the 7-day sliding expiry.
  - Security headers: `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`, `nosniff`, `Referrer-Policy`, HSTS, `Permissions-Policy`; `X-Powered-By` removed.
  - `audit_logs` is append-only for the service role (pgTAP-checked).
  - Audit rows added for product creation, colors and batch creation.
  - Settings section lookup uses `Object.hasOwn`; impossible dates in the recap filter fall back to defaults instead of throwing.
  - PDF proofs are served through download signed URLs.
- Accepted: the DP amount the agent types is not forced to equal the expected DP; the review screen flags any difference and the admin decides (a partial or rounded transfer can be legitimate).
- A full script CSP with nonces is not enabled (needs nonce plumbing through `proxy.ts`); the frame, base, form and object restrictions are.
- Unknown server errors show an Indonesian error page with only the error digest; `not-found` is in Indonesian. Route-level loading boundaries were rejected because they turn `notFound()` into HTTP 200 (see `docs/design-audit.md`).
- `cleanup_auth_records()` runs daily via pg_cron to delete long-expired sessions and old login attempts.
- Operations, backups, restore drill, first production admin and incident checks are in `docs/operations.md`.
