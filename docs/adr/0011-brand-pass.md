# 0011 — Brand and visual-identity pass

Status: accepted

## Decisions

- Reference: Bugar Swim (`n1git/bugarswim` at 9d6aaa6), read-only clone outside this repo. Its patterns were re-implemented, not copied. Kept where this app was already ahead: in-app confirm dialogs, tables that become cards on phones, the order modal, row menus, tooltips, timeline, empty states, bottom nav, density modes, 44px agent targets, axe tests and server-side filtering.
- Skills for this pass: `lean-dev` and `ui-ux-pro-max` only, as the brief asked.
- Bugs fixed:
  - `dark:` classes now follow only the `.dark` class (`@custom-variant dark`), so the OS setting no longer produces half-dark screens.
  - `tw-animate-css` is installed, so Sheet, Dropdown, Accordion and Tooltip animations run.
- Palette: terracotta family in light and dark (tokens in `app/globals.css`).
  - Brand band: `--brand` `#4a2319`, text `#f6ebe4`, muted `#d4b5a6`, ochre accent `#d9963b`. It covers the admin sidebar, login, landing hero and footer.
  - Approved refinements:
    - Links and text accents use `--primary-strong` (light `--primary` on the background is 4.28:1).
    - Dark `--border-strong` `#8a7266` for inputs.
    - Chart-only light tokens: ochre `#b07424`, rose `#a8675a`.
    - Dark soft variants for status colors and primary.
    - `--primary-strong` for text on dark `--primary-soft`.
  - Chart series order: terracotta, ochre, rust, rose, sand-dark.
- Dark mode:
  - Uses `next-themes` (class attribute, default follows the system). A Sun/Moon toggle sits in both shells, login and landing.
  - Dark values are defined under `@media screen`, so print is always light.
  - Every axe sweep runs in both themes.
- Identity:
  - `BrandMark`: an ochre circle with "A" in Fraunces next to the wordmark. It is a placeholder until the real logo arrives.
  - `app/icon.svg` uses the same mark.
  - Fraunces 600 (variable, with optical sizing, self-hosted, `font-display: swap`) for h1 and h2. Inter for everything else.
- Access: only `/` and `/icon.svg` are public, matched exactly in `proxy.ts`. A prefix exclusion would have also let `/icon.svg.evil` through, and a test covers that.
- Landing:
  - Static copy only.
  - The "Cara pesan" numbers (DP %, DP window, ETA days) come from settings.
  - The footer shows only the business name and the city. The city is the last part of the invoice-header address, without the postal code.
- Dashboard:
  - KPI tiles with an ochre top stripe, 2 per row on phones.
  - "Perlu perhatian" deep links, with zero rows hidden and a "Semua beres" state when empty.
  - Quick actions reuse the existing batch and agent dialogs.
  - Charts are Recharts, lazy-loaded on the client, themed through CSS variables, and each has a screen-reader table. The chart area is a labelled group so its keyboard tooltips stay reachable.
  - Data comes from read-only queries on existing tables.
- Rekap: a daily order-value line and a per-agent value bar chart above the tables.
- Lists (admin orders, agent orders, products, agents, audit log):
  - Debounced URL search (300ms), counter "Menampilkan x–y dari n", page size 10/20/50, and First/Prev/Next/Last.
  - Orders and the audit log page in SQL with an exact count. Products and agents are small lists and page on the server after the existing query.
  - Audit search matches the Indonesian action labels.
- Loading and errors:
  - Page-shaped skeletons for lists, dashboard, recap, catalog and cart.
  - List pages with detail children (products, orders, catalog) moved into `(list)` route groups, so detail pages keep real 404s (ADR 0009); URLs are unchanged.
  - Each route group has an `error.tsx` with retry. It shows only the error digest, never the message.
- Motion:
  - 150ms color, background, border and shadow transitions.
  - Button press scale 0.97, and a hover lift on catalog cards only.
  - All of it is off under `prefers-reduced-motion`.
- New dependencies: `next-themes`, `recharts`, `tw-animate-css`, `@fontsource-variable/fraunces`.

## Needs client input

- The real Aurora logo, to replace the `BrandMark` placeholder and `app/icon.svg`.
- Contact details for the landing footer (phone or WhatsApp, Instagram, full address). Only the name and city are shown for now.

## Open

- Moving from an admin page into `/orders` (the `(shared)` group) can briefly show the previous page's skeleton shape.
- `proxy.ts` still excludes any path starting with `login` from the session check. This predates this pass; such paths 404.
