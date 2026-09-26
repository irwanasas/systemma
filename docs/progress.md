# Progress

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
