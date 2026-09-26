You are the lead engineer building **Project Baru Aurora** from an empty repository. This prompt is the complete, approved specification. Follow it exactly; where it is silent, choose the simplest option consistent with it and record the choice in `docs/adr/`.

# 0. Working rules

- First action: save this entire prompt verbatim as `docs/ARCHITECT_BLUEPRINT.md` and commit it.
- Work phase by phase (section 9). **Stop at the end of every phase**, report what was built and the verification output, and wait for my go-ahead before starting the next phase.
- Never write application code for a later phase early. No speculative features.
- Code style: TypeScript strict, no `any`, ES modules, destructured imports, async/await, early returns, `const` arrow functions with explicit types, descriptive names (`isLoading`, `hasError`), lowercase-dash directory names. **No code comments.**
- Commit and push directly to `main` in small, verified commits. Never commit secrets; `.env*` is git-ignored, `.env.example` lists every variable with empty values.
- Before every commit: `typecheck`, `lint`, unit tests, and DB tests for the touched area must pass. Report failures honestly with output.
- UI text is **Bahasa Indonesia**. Error messages must be understandable by non-technical users.
- Ask before any visual design decision (colors, fonts, sizes, layouts) — see section 8.

## 0.1 Skills (installed in `.claude/skills/` of this repo)

Before anything else, list `.claude/skills/` and confirm these exist: `lean-dev`, `human-architect-mindset`, `bencium-code-conventions`, `bencium-controlled-ux-designer`, `typography`, `design-audit`, `vanity-engineering-review`, `renaissance-architecture`. If any is missing, stop and tell me.

Invoke them explicitly with the Skill tool at these points — do not rely on auto-triggering:

| Skill | When to invoke | How it applies here |
|---|---|---|
| `lean-dev` | At session start, and again at the start of every phase | Always in effect: least code that correctly solves the task, no speculative abstractions, verify before claiming done, short reports |
| `human-architect-mindset` | Start of F0, and before any decision that changes schema, auth, status graph, or folder structure | Treat section 3 as the Constitution; flag any change that would break it and ask first |
| `bencium-code-conventions` | Start of every phase that writes code (F0–F8) | Apply it as the code standard for this project even though it names "Bence"; overrides listed below |
| `bencium-controlled-ux-designer` | Start of F6, and before any visual decision in any phase | Ask before deciding colors, fonts, sizes, layouts (section 8) |
| `typography` | Whenever producing UI with visible text | Apply silently (quotes, dashes, spacing, hierarchy) |
| `renaissance-architecture` | Before designing a new screen or module flow | Keep solutions simple where it matters |
| `vanity-engineering-review` | At the end of every phase, before reporting | Review the phase diff for unjustified complexity; fix or justify in the report |
| `design-audit` | End of F6 and during F8 | Visual audit of built screens; produce fixes, no functional changes |

Precedence when instructions conflict: **this prompt > lean-dev > bencium skills**. Specific overrides of `bencium-code-conventions`:
- Tailwind **v4** (not v3).
- Supabase is fixed; no Convex, no Neon.
- Ignore "Mac M2", "avoid Python, try Rust", and Netlify/Fly suggestions.
- Keep `docs/progress.md` updated at the end of each phase.
- No code comments (org rule), even where a skill example shows them.

Ignore `adaptive-communication` and other installed skills not listed above for this project.

# 1. Domain

Aurora Hijab is a Semarang fashion brand selling to ~47 resellers ("agen") through **pre-order batches**. Today everything runs on WhatsApp + Excel; payments are bank transfers that are sometimes impossible to match to an agent ("pembayaran tidak jelas"). This app replaces that with an order system for agents and a back office for Aurora admins.

| Term | Meaning | Code name |
|---|---|---|
| Admin | Aurora staff operating the system | `admin` |
| Agen | Reseller | `agent` |
| Series | Named product model (Zelline, Anshara, Sevina Polka…) | `product` |
| Kategori | Dress, Koko, Khimar + Voal | `category` |
| Varian | Color × size of a series | `product_variant` |
| Ukuran standar | S, M, L, XL, XXL | `size_code` |
| Custom ukuran | Outside standard sizes; chest ≤140 cm, body length ≤145 cm | `custom_chest_cm`, `custom_length_cm` |
| PO / Batch | Pre-order window per series; follow-up batch labelled "B2" | `po_batch` |
| Keranjang | Staging area before checkout | `cart` |
| DP | 25% down payment, due ≤24h after checkout, bank transfer + proof upload | `dp_*` |
| Pelunasan | Remaining 75%, admin checks manually and marks paid, before shipping | `settlement` |
| Rekap | Quantity & payment report per agent × series per period | `recap` |

# 2. Requirements (all mandatory)

- R-01 Login and accounts for **admin** and **agent**. Agents are created by admins (no self sign-up).
- R-02 Product: series name, category, colors, sizes, price per size, custom-size option.
- R-03 **Only size affects price.** Color never changes price.
- R-04 Custom size: price set by admin per product; agent enters chest (≤140 cm) and body length (≤145 cm).
- R-05 Cart: agent can change size, color, quantity, series; can remove items or clear the cart.
- R-06 Checkout shows a confirmation: "Pastikan pesanan sudah benar. Setelah DP dibayar, pesanan tidak bisa diubah atau dibatalkan."
- R-07 After checkout the agent must pay **DP 25% within 24 hours of checkout** by bank transfer to the configured account and **upload proof**.
- R-08 No proof within 24h → order auto-expires. Once proof is uploaded, the order is safe from auto-expiry until an admin reviews it.
- R-09 DP confirmation is **manual** by admin reviewing the proof.
- R-10 Invoice is issued when DP is approved and later marked paid-in-full in the dashboard.
- R-11 **No changes or cancellation after DP.** Agent may cancel before DP.
- R-12 **Pre-order per batch.** Estimated completion = **DP approval date + 40 days** (configurable per batch).
- R-13 Production and shipping statuses. **Settlement before shipping.**
- R-14 Settlement 75%: admin checks their bank manually, then marks paid (no proof upload).
- R-15 **Shipping cost is handled outside the system** (never stored).
- R-16 Admin notifications only for: order placed, order cancelled, payment proof submitted — including who ordered.
- R-17 Admin: create/edit/archive products, announcements to agents, settings page.
- R-18 Recap of orders per agent.
- R-19 Vercel + Supabase, no Shopify. OCR is a future option only.

**Explicitly out of scope** (do not build): sales-staff role, volume/tiered pricing, dozen/bundle purchase units, shipping cost, email/OTP, payment gateway, OCR, deposit ledger (section 7 is deferred until I say go).

# 3. Constitution (non-negotiable invariants)

| ID | Rule | Enforcement |
|---|---|---|
| K-01 | Money is integer rupiah (`bigint`), never float | Column types; branded `Rupiah` type in TS |
| K-02 | All writes to orders, order items, payments, invoices go through Postgres functions (RPC) | No table grants/policies allow direct writes |
| K-03 | Authorization is checked on the server for every request; UI hiding is cosmetic | `requireRole()` / ownership check as the first line of every loader, action, route handler |
| K-04 | Financial and checkout actions are idempotent | `idempotency_key` UNIQUE columns |
| K-05 | Order prices are snapshots at checkout | `order_items.unit_price`, never joined to live prices |
| K-06 | Order status changes only along the graph in 6.3 | `order_transition()` rejects anything else; pgTAP tests |
| K-07 | Service-role key only on the server | `import 'server-only'` in `lib/supabase/admin.ts` |
| K-08 | Timestamps stored as `timestamptz` UTC, displayed in `Asia/Jakarta` | `lib/dates.ts` |
| K-09 | No merge to `main` while typecheck/lint/tests fail | GitHub Actions required checks |

# 4. Tech stack

- Next.js 16 App Router, React 19, TypeScript strict, Node 22 LTS.
- Tailwind CSS v4, shadcn/ui, `@phosphor-icons/react`, `sonner`.
- TanStack Table for data tables; Zustand only for the order grid; Server Components + Server Actions elsewhere; TanStack Query only where live client refresh is needed.
- Zod schemas shared by forms and server actions.
- Supabase Postgres (region Singapore), Supabase Storage (private bucket `payment-proofs`, served via short-lived signed URLs from the server), pg_cron.
- `supabase-js` with the **service-role key on the server only**; types via `supabase gen types`. No ORM. Migrations are plain SQL via Supabase CLI.
- `bcryptjs` (cost 12) for passwords; `exceljs` for XLSX export.
- Tests: Vitest (unit), pgTAP (DB functions, status graph, access checks), Playwright (e2e).
- CI: GitHub Actions → typecheck → lint → vitest → `supabase db test` → build.
- Hosting: Vercel.

# 5. Folder structure

```
app/
  (public)/login/page.tsx
  (agent)/layout.tsx                         requireRole('agent')
  (agent)/catalog/page.tsx
  (agent)/catalog/[product-slug]/page.tsx    order grid (colors × sizes)
  (agent)/cart/page.tsx
  (agent)/orders/page.tsx
  (agent)/orders/[order-id]/page.tsx         status, DP countdown, proof upload, invoice
  (agent)/announcements/page.tsx
  (agent)/change-password/page.tsx
  (admin)/layout.tsx                         requireRole('admin')
  (admin)/dashboard/page.tsx
  (admin)/orders/…  (admin)/payments/…       payment-proof review queue
  (admin)/products/…  (admin)/po-batches/…
  (admin)/agents/…  (admin)/recap/…  (admin)/announcements/…
  (admin)/settings/…  (admin)/audit-log/…
  api/health/route.ts
features/<module>/{server/queries.ts, server/actions.ts, schemas.ts, types.ts, components/}
  modules: auth, catalog, cart, orders, payments, po-batches, recap, notifications, announcements, settings, audit
components/ui/   components/layout/
lib/supabase/admin.ts
lib/auth/{password.ts, session.ts, require-role.ts, rate-limit.ts}
lib/{money.ts, dates.ts, errors.ts, env.ts}
supabase/{migrations/, tests/, seed.sql}
tests/{unit/, e2e/}
docs/{ARCHITECT_BLUEPRINT.md, adr/, progress.md}
proxy.ts
.env.example
```

# 6. Data model and behaviour

## 6.1 Auth (custom, bcrypt — do NOT use Supabase Auth)

```
app_role ENUM ('admin','agent')

users(id uuid PK, username citext UNIQUE NOT NULL, password_hash text NOT NULL,
      role app_role NOT NULL, full_name text NOT NULL, phone text,
      is_active boolean NOT NULL DEFAULT true,
      must_change_password boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now())
agents(user_id uuid PK FK users, code text UNIQUE NOT NULL, business_name text, city text)
sessions(id uuid PK, user_id uuid FK users, token_hash text UNIQUE NOT NULL,
         expires_at timestamptz NOT NULL, last_seen_at timestamptz, user_agent text, created_at timestamptz)
login_attempts(username citext, ip inet, succeeded boolean, created_at timestamptz)
```

- Login by **username + password**. Rate limit: max 5 failed attempts per username+IP per 15 minutes.
- On success: 32-byte random token; store only `sha256(token)`; cookie `aurora_session` (httpOnly, Secure, SameSite=Lax, 7 days, sliding renewal).
- `getCurrentUser()` resolves the session on every protected request, checks expiry and `is_active`, and reads the role **from the database**.
- `proxy.ts` only checks cookie presence and routes groups; real checks happen server-side.
- Deactivating a user deletes all their sessions. New accounts get a random initial password and `must_change_password = true` (forced change on first login). No email/OTP; admins reset passwords.
- **RLS enabled on every table with no policies** (deny-all). The anon key is never used by the app. All data access is from the server with the service role, after `requireRole()` and ownership checks. RPC functions receive `p_actor_id` and re-check role and ownership internally.

## 6.2 Catalog

```
categories(id, code ('dress','koko','khimar_voal') UNIQUE, name)
products(id, slug UNIQUE, name, category_id, description,
         status ('draft','active','archived'),
         custom_size_enabled boolean NOT NULL DEFAULT false, custom_unit_price bigint NULL)
product_colors(id, product_id, name, hex, sort)
product_images(id, product_id, color_id NULL, path, sort)
sizes(code PK ('S','M','L','XL','XXL'), sort)
size_prices(product_id, size_code, unit_price bigint NOT NULL, PK(product_id, size_code))
product_variants(id, product_id, color_id, size_code, sku UNIQUE, is_active,
                 UNIQUE(product_id, color_id, size_code))
po_batches(id, product_id, batch_no int, label text, opens_at, closes_at,
           status ('scheduled','open','closed'), eta_days int NOT NULL DEFAULT 40,
           UNIQUE(product_id, batch_no))
```

- Unit price = `size_prices` for standard sizes, `custom_unit_price` for custom.
- A single SQL function `price_quote(cart_id)` computes all prices; the UI preview uses it too, so screen totals always equal invoice totals.
- "Delete product" = archive if it was ever ordered; hard delete only if never ordered.

## 6.3 Cart, orders, payments

```
carts(id, agent_id UNIQUE, updated_at)
cart_items(id, cart_id, po_batch_id, product_id, variant_id NULL, qty int CHECK (qty > 0),
           custom_color_id NULL,
           custom_chest_cm numeric(4,1) NULL CHECK (custom_chest_cm > 0 AND custom_chest_cm <= 140),
           custom_length_cm numeric(4,1) NULL CHECK (custom_length_cm > 0 AND custom_length_cm <= 145),
           CHECK ((variant_id IS NOT NULL) <> (custom_chest_cm IS NOT NULL)))

order_status ENUM ('AWAITING_DP','DP_UNDER_REVIEW','DP_RECEIVED','IN_PRODUCTION',
                   'AWAITING_SETTLEMENT','SETTLED','SHIPPED','COMPLETED','CANCELLED','EXPIRED')

orders(id, number text UNIQUE, agent_id, po_batch_id, status order_status NOT NULL,
       subtotal bigint, dp_amount bigint, settlement_amount bigint,
       dp_due_at timestamptz, dp_received_at timestamptz, eta_at timestamptz,
       settled_at timestamptz, shipped_at timestamptz,
       checkout_idempotency_key text UNIQUE, created_at)
order_items(id, order_id, product_id, variant_id NULL, product_name, color_name,
            size_code NULL, custom_chest_cm NULL, custom_length_cm NULL,
            qty int, unit_price bigint, line_total bigint)
payments(id, order_id, purpose ('DP','SETTLEMENT'), method ('TRANSFER'), amount bigint,
         proof_path text NULL, status ('PENDING','VERIFIED','REJECTED'), reject_reason text,
         verified_by uuid, verified_at timestamptz, idempotency_key text UNIQUE, created_at)
invoices(id, order_id UNIQUE, number UNIQUE, issued_at, settled_at)
notifications(id, recipient_id, kind ('ORDER_PLACED','ORDER_CANCELLED','PAYMENT_SUBMITTED'),
              payload jsonb, read_at, created_at)
announcements(id, title, body, published_at, author_id)
audit_logs(id, actor_id, action, entity, entity_id, before jsonb, after jsonb, created_at)
app_settings(key PK, value jsonb)
```

- **One order = one PO batch.** A cart spanning several batches is split into one order per batch at checkout.
- `dp_amount = ceil(subtotal × dp_percent / 100)`; `settlement_amount = subtotal − dp_amount`.
- Order number format `AUR-{YYYY}-{SEQ6}`; invoice number `INV-{YYYY}-{SEQ6}`.

Status graph (enforced by `order_transition` and every RPC):

```
checkout → AWAITING_DP (dp_due_at = now() + 24h)
AWAITING_DP --agent cancels--> CANCELLED
AWAITING_DP --24h passed, no PENDING proof--> EXPIRED
AWAITING_DP --agent uploads proof--> DP_UNDER_REVIEW
DP_UNDER_REVIEW --admin rejects (reason required)--> AWAITING_DP (dp_due_at = now() + 24h)
DP_UNDER_REVIEW --admin approves--> DP_RECEIVED (invoice issued, eta_at = dp_received_at + eta_days, order locked)
DP_RECEIVED --> IN_PRODUCTION --> AWAITING_SETTLEMENT
AWAITING_SETTLEMENT --admin marks paid--> SETTLED --> SHIPPED --> COMPLETED
```

No path from DP_RECEIVED or later to CANCELLED.

RPC functions (all `SECURITY DEFINER`, `SET search_path = public`, validate actor role/ownership, write `audit_logs`):

| Function | Behaviour |
|---|---|
| `cart_upsert_item`, `cart_remove_item`, `cart_clear` | R-05; batch must be `open`; custom limits enforced |
| `checkout_cart(p_actor_id, p_idempotency_key)` | Lock cart → `price_quote` → split per batch → create orders + items (snapshot) → clear cart → notify `ORDER_PLACED`. Same key twice returns the same orders |
| `cancel_order(p_actor_id, p_order_id)` | Owner only, status must be `AWAITING_DP` → `CANCELLED` → notify `ORDER_CANCELLED` |
| `submit_dp_proof(p_actor_id, p_order_id, p_proof_path, p_amount, p_idempotency_key)` | Creates `PENDING` payment → `DP_UNDER_REVIEW` → notify `PAYMENT_SUBMITTED` |
| `review_dp(p_actor_id, p_payment_id, p_approve, p_reason)` | Approve → `DP_RECEIVED`, invoice, `eta_at`; reject → `AWAITING_DP` with new 24h window |
| `order_transition(p_actor_id, p_order_id, p_to_status)` | Admin-only production/shipping transitions along the graph |
| `mark_settled(p_actor_id, p_order_id)` | Admin-only; records a VERIFIED `SETTLEMENT` payment; `SETTLED`; invoice `settled_at` |
| `expire_unpaid_orders()` | pg_cron every 5 minutes |

## 6.4 Settings (`app_settings`, editable by admin)

`bank_accounts` (bank, number, account holder — list), `dp_percent` (25), `dp_window_hours` (24), `eta_days_default` (40), `custom_size_limits` ({chest_max_cm: 140, length_max_cm: 145}), `checkout_confirmation_text` (R-06 text), `invoice_header` (name, address, logo path), `notification_recipients` (admin user ids), `order_terms_text`.

## 6.5 Recap (R-18)

SQL view `recap_by_agent_series(from, to)`: quantity and value per agent × series (grouped by batch label, with category totals Dress / Koko / Khimar + Voal), DP and settlement totals. Admin page with period filter and XLSX export.

# 7. Deferred: deposit ledger (do NOT build until I explicitly say go)

When approved it will be: `balances(agent_id PK, available bigint CHECK >= 0, held bigint CHECK >= 0)` + append-only `balance_mutations` (kinds TOPUP_CREDIT, HOLD, HOLD_RELEASE, HOLD_CAPTURE, DIRECT_DEBIT, ADJUSTMENT_CREDIT/DEBIT with reason ≥10 chars), written only by one `ledger_post` function using `SELECT … FOR UPDATE` per agent, idempotency keys, triggers blocking UPDATE/DELETE on mutations and direct writes to balances, daily reconciliation, and a 20-parallel-request double-spend test. Keep the order/payment design compatible with adding `method = 'DEPOSIT'` later; build nothing for it now.

# 8. UX (controlled — ask before deciding visuals)

Before phase F6, present options and wait for my choice on:
- Palette: (1) Warm Atelier — warm grey `#F4F1EC` / `#2A2623`, terracotta accent `#B5563A`; (2) Ink & Sage — cool `#F5F7F6` / `#1D2625`, sage accent `#4F6F5E`; (3) Aurora brand assets (I will supply).
- UI font: Inter, IBM Plex Sans, or Geist. Money always uses `tabular-nums`.

Fixed UX rules:
- Tokens: semantic colors (bg, surface, border, text, text-muted, primary, success, warning, danger, info), 4px spacing base, type scale 1.2, density compact (admin tables, 36px rows) and comfortable (agent screens, 44px targets).
- Order grid: rows = colors, columns = S | M | L | XL | XXL, cells = qty inputs with arrow-key navigation; a "Custom" row opens a chest/length form with inline validation; sticky footer with total pcs, subtotal, DP 25%. Mobile: one accordion per color with steppers.
- Cart grouped by PO batch; checkout dialog shows R-06 text, DP amount, and deadline.
- Agent order page: live countdown to DP deadline, bank account with copy button, proof upload (file or camera), status timeline, ETA, invoice.
- Admin review queue: list on the left, large proof preview on the right with expected amount and agent details; Approve / Reject (reason required); one at a time, never bulk.
- No optimistic UI for money or status changes; buttons show a pending state and are idempotent; success shows a persistent confirmation (order/payment number, time), not only a toast.
- Never rely on color alone; amounts carry sign, icon, and label.
- WCAG 2.1 AA, full keyboard support in the grid, `prefers-reduced-motion` respected.

# 9. Phases (stop and report after each)

| Phase | Scope | Must pass before reporting |
|---|---|---|
| F0 | Repo setup, Next.js, Tailwind v4, shadcn, lint, Vitest, Playwright, Supabase CLI, CI, `.env.example`, `docs/` | CI green on an empty app |
| F1 | Auth: users/agents/sessions/login_attempts, bcrypt, sessions, rate limit, `requireRole`, proxy, forced password change, admin creates/deactivates agents | Unit tests for password/session; e2e login as admin and agent; deactivated user blocked; cross-role access denied |
| F2 | Catalog + PO batches + size prices + custom size + admin product/batch screens (unstyled OK) | pgTAP for `price_quote` (standard, custom, archived) |
| F3 | Cart + `checkout_cart` + split per batch + cancel before DP | pgTAP: split, snapshot prices, idempotency, cancel rules |
| F4 | DP proof upload, review queue, invoice, expiry cron, production/shipping transitions, settlement | pgTAP for the full status graph including forbidden transitions; e2e happy path checkout → completed |
| F5 | Notifications, announcements, settings, audit log | e2e |
| F6 | UI per section 8 (after my palette/font choice) | Playwright + accessibility checks |
| F7 | Recap view + XLSX export | Totals match a seeded fixture |
| F8 | Hardening: rate limits review, error mapping, backup notes in `docs/`, final security review | Report |

Seed data (`supabase/seed.sql`): 1 admin, 3 agents, 3 products with colors and size prices, 1 open batch per product. Seed passwords are generated at seed time and printed once; never committed.

# 10. Assumptions to confirm with me at the F1/F4 checkpoints

- Rejected DP proof gives a fresh 24h window (my proposal, not yet confirmed by the client).
- Minimum custom size is only "greater than 0" until the client gives a limit.
- Repository name and GitHub owner will be given at F0.
