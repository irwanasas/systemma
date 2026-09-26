# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Aurora
**Generated:** 2026-09-26 13:51:28
**Category:** B2B pre-order ordering (fashion reseller portal + back office)

---

## Global Rules

### Color Palette

Warm Atelier (approved, `docs/adr/0007-f6-ui.md`); tokens live in `app/globals.css`. All pairs below meet WCAG AA.

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#F4F1EC` | `--bg` → `--color-background` |
| Surface / Card | `#FBF9F6` | `--surface` → `--color-surface`, `--color-card` |
| Muted surface | `#EDE8E1` | `--surface-muted` → `--color-muted` |
| Divider | `#D9D1C6` | `--border` → `--color-border` |
| Input border | `#8C8177` | `--border-strong` → `--color-input` (3.6:1) |
| Text | `#2A2623` | `--text` → `--color-foreground` (13.3:1) |
| Muted text | `#5F574F` | `--text-muted` → `--color-muted-foreground` (6.3:1) |
| Primary (fills, white text 4.82:1) | `#B5563A` | `--primary` → `--color-primary` |
| Primary strong (text links, 5.59:1) | `#9C4630` | `--primary-strong` |
| Primary soft | `#F3E1DA` | `--primary-soft` |
| Success / soft | `#2E6A4B` / `#E3EFE7` | `--success`, `--success-soft` |
| Warning / soft | `#8A5400` / `#F6E9D2` | `--warning`, `--warning-soft` |
| Danger / soft | `#A1262B` / `#F6E0DE` | `--danger` → `--color-destructive`, `--danger-soft` |
| Info / soft | `#2D5B7A` / `#E0EAF1` | `--info`, `--info-soft` |
| Focus ring | `#2A2623` | `--color-ring` |

**Color Notes:** Warm neutrals with a terracotta accent. Never use the primary as a text color on the background (4.28:1); use primary strong. Status is never color-only (icon + label).

### Typography

- **Heading and body font:** Inter (variable), self-hosted via `@fontsource-variable/inter` (approved; no Google Fonts request at runtime).
- **Scale:** ratio 1.2 on a 16px base — 13.3 / 16 / 19.2 / 23 / 27.6 / 33.2 px (`--text-sm` … `--text-3xl`).
- **Weights:** 400 body, 500 labels, 600 headings and buttons.
- **Numbers:** money, quantities and dates use `tabular-nums`.
- **Minimum sizes:** body 16px on the agent portal, 14px in admin tables; labels 13px; never below 12px.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--primary-strong);
  border: 1px solid var(--border-strong);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: var(--primary-strong);
  outline: none;
  box-shadow: 0 0 0 3px rgb(42 38 35 / 0.2);
}
```

### Modals

One modal shape for the whole app (redesign brief §3a), built on the shadcn `Dialog`:

- Centered on every screen size: `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`, width `calc(100vw - 2rem)`, `max-w-lg` (simple) or `max-w-3xl` (order modal), `rounded-xl`, 1px border, `shadow-xl`, surface background.
- Max height 90% of the visual viewport on ≥640px, 95% below, updated on `visualViewport` resize.
- Header (title + Phosphor `X` close with `aria-label="Tutup"`, bottom border) · body is the only scroll area · footer pinned with a top border.
- Enter/exit: fade + scale 95→100%, ~180ms ease-out; backdrop `black/50` fades in; no blur. Reduced motion: no scale.
- Esc, backdrop and close button all close it; with unsaved changes they ask “Buang perubahan?” first. Focus trapped; focus returns to the trigger.

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools

**Key Effects:** Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Page Pattern

**Pattern Name:** App shell (replaces the generated “Scroll-Triggered Storytelling”, which is a landing-page pattern)

- **Agent portal:** mobile-first; bottom navigation (≤4 items) on phones, top navigation on desktop; content column max 72rem.
- **Admin back office:** left sidebar grouped by task on ≥1024px, collapsible drawer below; compact density (36px rows and controls).
- **Actions:** one primary action per view; destructive actions in a separated “Zona berbahaya” card or a row menu, always confirmed.

---

## Anti-Patterns (Do NOT Use)

- ❌ Excessive decoration

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use Phosphor icons (`@phosphor-icons/react`), one family only
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from Phosphor
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
