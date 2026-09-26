# 0010 — UI pass (ui-ux-pro-max)

Status: accepted

## Decisions

- Visual and interaction changes only. No RPC, schema, permission or route-path changes. Read-only queries were extended where a screen needed more data: catalog colors, product slugs for cart edits, agent phone and last order date, and audit actor filter.
- Warm Atelier palette and Inter stay. The `text-ui` token (0.875rem) is registered in `tailwind-merge` so it is not mistaken for a color class. `tabular-nums` applies only to right-aligned numeric cells and explicit amounts, so hyphenated codes such as `AUR-2026-000011` keep normal spacing.
- Phosphor is the only icon family. New dependencies are `sonner` (toasts) and shadcn sidebar, sheet, dropdown-menu, tooltip, tabs and table. These need only `radix-ui`, which was already installed.
- Admin shell: grouped sidebar (collapses to a sheet below 1024px), bell and account menu. Agent shell: top navigation from 768px up, and a bottom navigation below that with the cart count.
- One dialog shape everywhere (§3a):
  - Centered on all screens; width `calc(100vw - 2rem)`; max height 90% of the visual viewport, or 95% below 640px.
  - Bordered header and footer, with the body as the only scroll area.
  - 180ms fade and scale, disabled under reduced motion.
  - In-app confirm dialogs replace `window.confirm`.
- Order modal:
  - Built with `app/(agent)/@modal/(.)catalog/[product-slug]`, so the URL stays shareable and Back closes the modal. Direct loads render the full page.
  - Grid from 768px up, with 96px size columns and −/+ steppers; below 768px, one accordion per color.
  - Custom size is an inline section in the modal.
  - Closing with unsaved changes asks "Buang perubahan?".
  - The modal closes only after the server confirms, then shows a toast with "Lihat keranjang". Focus returns to the card or cart link.
  - "Ubah" on a cart group opens the same modal pre-filled, with the footer button "Simpan perubahan".
  - A catch-all modal slot was rejected because it registers a global `/[...rest]` route.
- Order lists, products and agents filter and paginate in memory, driven by GET params (`q`, `status`, `category`, `page`). This works on data already fetched, which for orders is capped at 200 per status. Audit log paging stays server-side.
- Product edit and settings use tabs (settings: vertical on large screens, horizontal on phones). Batch creation and agent creation are dialogs. The agent dialog keeps the one-time password visible until closed.
- The catalog has no product photos: cards use a color-swatch header with the series initial. Adding photos is a feature decision.
- Route-level `loading.tsx` stays out (ADR 0009). Empty, not-found and error screens share `EmptyState` and `StatusPage`.

## Tests

- Unit: `cn` with `text-ui`, short date format, list params, recap presets, audit labels.
- e2e: specs moved to the new flows (modal add and edit, discard guard, cart badge, tabs, dialogs, row menu, collapsible recap). Every earlier assertion is kept. Added an axe scan of the open order modal and of `/products/new`.
- pgTAP unchanged.
