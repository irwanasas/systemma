# 0006 — F5 notifications, announcements, settings and audit decisions

Status: accepted

## Decisions

- `/announcements` is in the `(shared)` group (same route conflict as `/orders`, see ADR 0005): agents read, admins also write and delete. Announcements publish immediately; there are no drafts.
- Notifications are shown on the admin dashboard with the agent name, agent code and order link; the header shows the unread count on every admin page. "Mark all as read" is per admin.
- Settings are edited in separate small forms (bank accounts, DP rules, custom limits, texts, invoice header, notification recipients). Values are validated with Zod before writing `app_settings`; custom-size limits cannot exceed the database limits of 140/145 cm. DP rules only affect new orders (existing orders keep their stored amounts and deadlines).
- Every settings change writes an audit row with the previous and new values, because bank account changes decide where agents send money. Agent creation, deactivation and password reset, product edits, size prices, product delete/archive, batch status and announcements are audited too, in addition to the RPC audit rows from F3/F4.
- The invoice logo is not configurable yet (needs an upload flow); `logo_path` stays `null`.
- `eta_days_default` is the default of the batch form; each batch keeps its own `eta_days` (R-12).
