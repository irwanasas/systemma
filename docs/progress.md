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
