# 0004 — F3 cart and checkout decisions

Status: accepted

## Decisions

- `app_settings` (with the §6.4 defaults), `notifications`, `audit_logs` and `document_counters` are created in F3 because the F3 RPCs read `dp_percent`/`dp_window_hours`, notify admins and write audit logs. Their admin screens come in F5.
- K-02 is enforced with grants: the service role keeps `select` but loses `insert/update/delete/truncate` on `orders`, `order_items`, `carts`, `cart_items`. Only the `SECURITY DEFINER` RPCs (owned by `postgres`) write them. pgTAP checks this.
- K-06 is enforced in the database: a trigger on `orders` only allows `AWAITING_DP` on insert and the §6.3 edges on status updates (`order_transition_allowed`). RPCs add their own role and ownership checks on top.
- `checkout_idempotency_key` is UNIQUE per order, but one checkout can create several orders, so each order stores `<key>:<po_batch_id>`. The key is a UUID generated when the cart page renders. A repeat call with the same key (after locking the cart row) returns the existing orders.
- DP is computed only in SQL (`dp_amount_for`), per order: `ceil(subtotal × dp_percent / 100)`. The cart preview calls the same function per batch, so the screen DP equals the order DP.
- Order and invoice numbers come from `next_document_number(prefix)`: a per-prefix, per-year counter (year in Asia/Jakarta), gapless because it is updated in the same transaction.
- `cart_upsert_item` sets the absolute quantity for a (batch, variant) pair (0 removes it), which fits the order grid; custom-size lines are separate rows edited by id. Changing a line's size or color is done in the product grid.
- Admin notifications go to `notification_recipients` from settings, or to every active admin when that list is empty.
- RPC exceptions use short codes (`BATCH_NOT_OPEN`, `CART_EMPTY`, …) mapped to Indonesian messages in `lib/errors.ts`; unknown errors are rethrown.
- Checkout confirmation is a required checkbox under the R-06 text on the cart page; F6 turns it into the dialog from §8. After checkout the orders page shows a persistent confirmation with the order numbers and times.
- `ActionForm` submits through `startTransition` instead of the form `action` prop, because React 19 resets uncontrolled fields after an action and wiped user input on validation errors. All forms use it.
- E2E setup and cleanup run SQL through `psql` as the database owner (`E2E_DATABASE_URL`, default local), since the service role can no longer delete orders.
