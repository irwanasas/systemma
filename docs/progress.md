# Progress

## Working mode (from the owner, after F1)

- Build F2–F8 without stopping for confirmation between phases; run typecheck and lint every phase (plus unit/pgTAP/e2e where they exist).
- Push to `main`; do not wait for CI.
- No Vercel or cloud Supabase for now; local Supabase in Docker only.
- F6 visuals approved: palette Warm Atelier (`#F4F1EC` / `#2A2623`, accent `#B5563A`), UI font Inter.
- §10 assumptions not yet confirmed by the client; building with the blueprint's proposals: a rejected DP proof gives a fresh 24h window; custom size minimum is only "greater than 0".

## F0 — Repo setup

- Next.js 16.3 (App Router, React 19, TypeScript strict), Tailwind CSS v4, ESLint.
- shadcn/ui configured by hand (`components.json`, `lib/utils.ts`); no components or theme yet.
- Vitest (`tests/unit`), Playwright (`tests/e2e`), pgTAP via Supabase CLI (`supabase/tests`).
- `GET /api/health`.
- CI: typecheck → lint → vitest → `supabase test db` → build.

## F1 — Auth

- Tables `users`, `agents`, `sessions`, `login_attempts` with RLS on and no policies; `create_agent` function.
- bcrypt (cost 12) passwords, 32-byte session tokens stored as sha256, `aurora_session` cookie (7 days, sliding).
- Login rate limit (5 failures per username + IP per 15 minutes), `requireRole()`/`requireUser()`, `proxy.ts`.
- Forced password change, admin creates / deactivates agents and resets their passwords, logout.
- Seed: 1 admin + 3 agents with generated passwords (`npm run db:reset`).
- Tests: unit (password, session token), pgTAP (access rules, `create_agent`), e2e (login, cross-role, deactivation, forced change, agent creation, rate limit, logout). E2E runs in CI.

## F2 — Catalog

- Tables: categories, sizes (seeded), products, product_colors, product_images, size_prices, product_variants, po_batches, carts, cart_items.
- `price_quote(cart_id)` (single source of prices), variant sync triggers, one open batch per product.
- Admin: product list/create/edit, size prices, colors, delete-or-archive, PO batch create/open/close.
- Agent: catalog of active products with an open batch; product page with size prices, custom price, colors.
- `lib/money.ts` (branded `Rupiah`), `lib/dates.ts` (Asia/Jakarta), `lib/errors.ts`.
- Seed: 3 products with colors, size prices and an open B1 batch.
- Tests: pgTAP `price_quote` (standard, color-independent, custom, custom disabled, missing price, archived), unit (money, dates), e2e (admin product → batch → agent catalog).

## F3 — Cart and checkout

- Tables: orders, order_items, app_settings, notifications, audit_logs, document_counters; `order_status` enum with a status-graph trigger.
- RPCs: `cart_upsert_item`, `cart_remove_item`, `cart_clear`, `checkout_cart` (split per batch, price snapshot, idempotent, notifies admins), `cancel_order` (owner, before DP only).
- Agent: order grid and custom-size form on the product page, cart grouped by batch with DP preview, checkout with R-06 confirmation, orders list and detail, cancel.
- Tests: pgTAP (cart rules, split, DP rounding, snapshot, idempotency, notifications, cancel rules, K-02 grants), e2e (grid → custom → two-batch checkout → two orders; cancel; other agent gets 404).

## F4 — Payments and fulfilment

- Tables: payments, invoices; private Storage bucket `payment-proofs`.
- RPCs: `submit_dp_proof`, `review_dp` (approve → invoice + ETA; reject → reason + fresh 24h), `order_transition`, `mark_settled`, `expire_unpaid_orders` (pg_cron every 5 minutes).
- Agent: bank accounts, DP deadline, proof upload (file or camera), rejection reason, status timeline, payment history, invoice.
- Admin: order list with status filter, order detail with next-step buttons and settlement, DP review queue (one at a time, proof preview, expected vs submitted amount).
- `/orders` moved to a shared route group (ADR 0005).
- Tests: pgTAP full status graph (all 100 status pairs, forbidden transitions, idempotency, expiry, deadline), unit (proof file signatures), e2e (checkout → reject → re-upload → approve → production → settlement → shipped → completed; disguised file rejected).

## F5 — Back office

- Table: announcements.
- Admin dashboard: work counts (proofs to check, awaiting settlement, in production, awaiting DP) and notifications with mark-all-read; unread count in the header.
- Announcements (admin write/delete, agents read), settings page (bank accounts, DP %, DP window, default ETA, custom limits, checkout and terms texts, invoice header, notification recipients), audit log with filter and paging.
- Audit rows for sensitive admin actions.
- Tests: e2e (settings validation → bank account shown to agent, announcement lifecycle, order notification with agent, mark read, audit entry, agent blocked from admin pages).

## F6 — UI

- Warm Atelier tokens and Inter; base element styles; compact admin and comfortable agent density.
- Header with active navigation and unread notifications; login and password cards.
- Order grid (Zustand, arrow keys, phone accordion with steppers, sticky totals), custom-size disclosure with inline validation, cart cards with checkout dialog, DP countdown, copy buttons, status badges, timeline with icons, printable invoice, two-column DP review, dashboard tiles.
- Tests: axe WCAG 2.1 AA scans of login, 5 agent pages and 8 admin pages (no violations), grid keyboard navigation, phone accordion; existing e2e updated for the dialog and disclosure. Design audit notes in `docs/design-audit.md`.

## F7 — Recap

- SQL function `recap_by_agent_series(from, to)`; admin recap page with period filter, per-agent tables with category totals, period totals; XLSX export.
- Tests: pgTAP fixture (quantities and values across orders of one batch, cancelled excluded, received DP/settlement only, value equals order subtotals, period boundary), unit (summaries, period parsing), e2e (page and XLSX match a fixture order; agents blocked), axe on `/recap`.

## F8 — Hardening

- Security review (no High findings); fixes: throttling race and per-username cap, absolute session lifetime, security headers, append-only audit log, audit gaps, input edge cases, PDF proofs as downloads.
- Indonesian error and not-found pages; daily auth cleanup job; client bundles scanned for secrets (none).
- Design audit follow-ups (notifications, timeline marker).
- `docs/operations.md`: environment, cron jobs, first production admin, backups and restore drill, rate limits, headers, incident checklist.

## UI pass (ui-ux-pro-max) — in progress

Approved plan (owner said "go" to everything proposed, 2026-09-26): shell/navigation → tokens & base components → catalog → order modal (intercepting route) → cart/checkout/order detail → admin orders & review → products (tabs) & batch PO → agents → pengumuman/pengaturan (vertical tabs) → rekap (preset chips + native dates) / log audit → 404/empty/error. Add `text-ui` 0.875rem token for admin; `sonner` re-added; shadcn sidebar/sheet/dropdown-menu/tooltip/tabs/table. Agent "Info" tab = Pengumuman + account section. Catalog cards use color-swatch fallback (no photos). Before/after screenshots: `docs/ui/before`, `docs/ui/after` (demo seed `npm run db:demo`).
