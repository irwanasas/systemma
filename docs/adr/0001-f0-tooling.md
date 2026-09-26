# 0001 — F0 tooling choices

Status: accepted

## Decisions

- Package manager: npm (lockfile `package-lock.json`).
- Supabase CLI is a dev dependency (`npx supabase`), so local and CI use the same version.
- CI starts only the database (`supabase db start`), which is all pgTAP needs.
- shadcn/ui is configured by hand instead of `shadcn init`: the init presets pick fonts, icons and colors, which are section 8 decisions. `iconLibrary` is `phosphor`. The `neutral` base color only affects components added before F6; tokens are replaced in F6.
- The root layout loads no font and sets `lang="id"`; font choice is deferred to F6.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` optionally points Playwright at a preinstalled Chromium; unset, Playwright uses its own browser.
- Playwright e2e is not in CI yet; section 4 lists the CI steps without it.
- `@types/node` is pinned to `^22` to match Node 22 LTS.
