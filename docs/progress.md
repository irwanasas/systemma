# Progress

## F0 — Repo setup

- Next.js 16.3 (App Router, React 19, TypeScript strict), Tailwind CSS v4, ESLint.
- shadcn/ui configured by hand (`components.json`, `lib/utils.ts`); no components or theme yet.
- Vitest (`tests/unit`), Playwright (`tests/e2e`), pgTAP via Supabase CLI (`supabase/tests`).
- `GET /api/health`.
- CI: typecheck → lint → vitest → `supabase test db` → build.
