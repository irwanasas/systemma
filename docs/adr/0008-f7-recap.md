# 0008 — F7 recap decisions

Status: accepted

## Decisions

- `recap_by_agent_series(p_from, p_to)` is a SQL function (the blueprint calls it a view, but it takes a period). One row per agent × series × batch label, with category, number of orders, pcs, order value, DP received and settlement received.
- The period is the checkout date (`orders.created_at`), whole days in Asia/Jakarta, inclusive; the default is the current month to date.
- `CANCELLED` and `EXPIRED` orders are excluded. "DP received" counts `dp_amount` of orders whose DP was approved; "settlement received" counts `settlement_amount` of orders marked settled. Order value is always the snapshot subtotal.
- Category totals (Dress / Koko / Khimar + Voal) per agent and for the period are computed from the rows in `features/recap/summarize.ts`, shared by the page and the XLSX export, so both show the same numbers.
- The XLSX export is a route handler (`/recap/export`) behind `requireRole("admin")`, with one sheet: period header, one row per agent × series, a total row per agent with category pcs, and a grand total. Money cells are numbers with a rupiah format, so the sheet can be summed in Excel.
- `exceljs` depends on a `uuid` version with a moderate advisory (buffer bounds, only when a caller passes its own buffer); `package.json` overrides `uuid` to `^11.1.1`, and export generation is tested.
