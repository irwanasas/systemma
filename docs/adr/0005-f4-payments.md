# 0005 — F4 payments, review and fulfilment decisions

Status: accepted

## Decisions

- **Blueprint §5 conflict:** `(agent)/orders` and `(admin)/orders` resolve to the same URL, which Next.js rejects at build time. `/orders` and `/orders/[order-id]` live in a `(shared)` group; each page calls `requireActiveUser()` first, then renders the agent view (own orders only, others get 404) or the admin view, using the role read from the database. `/announcements` gets the same treatment in F5.
- Payment proofs go to the private `payment-proofs` bucket at `{agent_id}/{order_id}/{uuid}.{ext}`; `submit_dp_proof` refuses any other path. Files are checked on the server by size (≤ 5 MB) and by content signature (JPEG, PNG, WEBP, PDF), not by name or browser MIME type. Admins view proofs through 5-minute signed URLs. The server action body limit is 6 MB.
- If the RPC fails after upload, the uploaded file is deleted; a retried submission with the same idempotency key returns the original payment and the new duplicate file is deleted.
- Proof after `dp_due_at` is rejected (`DP_DEADLINE_PASSED`), even if the expiry job has not run yet. The amount the agent enters is stored as submitted; the review screen shows it next to the expected DP and flags a difference.
- `review_dp` and `mark_settled` are idempotent: repeating the same decision is a no-op; a conflicting decision fails with `PAYMENT_ALREADY_REVIEWED`. `mark_settled` records one VERIFIED `SETTLEMENT` payment (key `settlement:<order_id>`) for `settlement_amount`.
- `order_transition` only moves along DP_RECEIVED → IN_PRODUCTION → AWAITING_SETTLEMENT and SETTLED → SHIPPED → COMPLETED. SETTLED and DP_RECEIVED are reachable only through `mark_settled` and `review_dp`. The status trigger from F3 backs this up.
- `expire_unpaid_orders()` runs every 5 minutes via pg_cron and writes an audit log row per expired order (actor `NULL` = system).
- The invoice is shown on the order page (agent and admin): number, issue time, the header from settings, totals, and the settlement state. A printable layout is part of F6.
- Review confirmations are persistent: after approve/reject the queue page shows the order number and time.
- Local Supabase now also runs Storage (`db:start` no longer excludes `storage-api`).
