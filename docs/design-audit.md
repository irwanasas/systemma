# Design audit

## F6 (screens: login, catalog, product grid desktop/phone, cart, agent order, admin dashboard, orders, DP review)

Fixed during F6:

- Borders fell back to `currentColor` (Tailwind v4 has no default border color) → base `border-color: var(--border)`.
- Order grid stretched to full width with two sizes → grid table is `w-fit`.
- Plain `<button>`s (filters) rendered as bare text → base button style; filter forms are one row.
- Dashboard counts as a link list → four count tiles.
- Sticky grid footer was 16px off the page grid → same container padding as the page.
- Native file button unstyled → `::file-selector-button` styled like a secondary button.
- Primary `#B5563A` is 4.28:1 as text on the background → text links use `#9C4630` (5.59:1); white on `#B5563A` is 4.82:1.

Open for F8:

- Notifications on the dashboard are long single lines; a two-line item (what + who, then order + time) would scan faster.
- The current step in the order timeline uses a small dot icon; a filled, larger marker would read better.
- No route-level loading states (`loading.tsx`); pages are server-rendered and buttons show a pending spinner, so waits are short, but slow networks show no page skeleton.
- The native file button text follows the browser language.
