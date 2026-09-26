# Admin Page Overrides

> **PROJECT:** Aurora
> **Generated:** 2026-09-26 13:51:36
> **Page Type:** Dashboard / Data View

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** content column up to 1400px next to a 16rem sidebar
- **Grid:** 12-column grid for data flexibility
- **Sections:** page header (title + primary action) > filters > data card (table) > pagination

### Spacing Overrides

- **Content Density:** High — optimize for information display

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- No overrides — use Master colors (Warm Atelier)

### Component Overrides

- Avoid: Use arbitrary large z-index values
- Avoid: Leave UI frozen with no feedback
- Avoid: Single row actions only

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Hover tooltips, chart zoom on click, row highlighting on hover, smooth filter animations, data loading spinners
- Layout: Define z-index scale system (10 20 30 50)
- Animation: Use skeleton screens or spinners
- Data Entry: Allow multi-select and bulk edit
- CTA Placement: Contact Sales (Primary) + Login (Secondary)
