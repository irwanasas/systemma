import { randomUUID } from "node:crypto";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/ssr";
import { ActionForm } from "@/components/ui/action-form";
import { CheckoutDialog } from "@/features/cart/components/checkout-dialog";
import { clearCart, removeCartItem, updateCartLineQty } from "@/features/cart/server/actions";
import { getCart } from "@/features/cart/server/queries";
import { describeSize } from "@/features/orders/format";
import { getSettings } from "@/features/settings/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime, hoursFromNow } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const CartPage = async (): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const [cart, settings] = await Promise.all([getCart(user.id), getSettings()]);

  if (!cart.groups.length) {
    return (
      <main>
        <h1>Keranjang</h1>
        <p>Keranjang masih kosong.</p>
        <p>
          <Link href="/catalog">Buka katalog</Link>
        </p>
      </main>
    );
  }

  const dpDeadline = hoursFromNow(settings.dp_window_hours);

  return (
    <main>
      <h1>Keranjang</h1>
      {cart.groups.map((group) => (
        <section
          key={group.poBatchId}
          aria-labelledby={`batch-${group.poBatchId}`}
          className="rounded-lg border border-border bg-surface p-4"
        >
          <h2 id={`batch-${group.poBatchId}`}>
            {group.productName} · PO {group.batchLabel}
          </h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th scope="col">Warna</th>
                  <th scope="col">Ukuran</th>
                  <th scope="col" className="text-right">
                    Harga per pcs
                  </th>
                  <th scope="col">Jumlah</th>
                  <th scope="col" className="text-right">
                    Total
                  </th>
                  <th scope="col">
                    <span className="sr-only">Tindakan</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.lines.map((line) => {
                  const sizeLabel = describeSize(line.sizeCode, line.customChestCm, line.customLengthCm);
                  return (
                    <tr key={line.id}>
                      <td>{line.colorName}</td>
                      <td>
                        {sizeLabel}
                        {!line.isOrderable && (
                          <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-danger">
                            <WarningCircle aria-hidden="true" weight="bold" />
                            Tidak tersedia, hapus untuk melanjutkan
                          </span>
                        )}
                      </td>
                      <td className="text-right">{line.unitPrice === null ? "–" : formatRupiah(line.unitPrice)}</td>
                      <td>
                        <ActionForm action={updateCartLineQty} submitLabel="Ubah" pendingLabel="Menyimpan…" tone="secondary" className="!flex-row !items-center">
                          <input type="hidden" name="cartItemId" value={line.id} />
                          <input
                            name="qty"
                            type="number"
                            min={0}
                            defaultValue={line.qty}
                            aria-label={`Jumlah ${line.colorName} ${sizeLabel}`}
                            className="!w-20 tabular-nums"
                          />
                        </ActionForm>
                      </td>
                      <td className="text-right">{line.lineTotal === null ? "–" : formatRupiah(line.lineTotal)}</td>
                      <td>
                        <ActionForm
                          action={removeCartItem}
                          submitLabel={`Hapus ${line.colorName} ${sizeLabel}`}
                          pendingLabel="Menghapus…"
                          tone="secondary"
                        >
                          <input type="hidden" name="cartItemId" value={line.id} />
                        </ActionForm>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="tabular-nums">
            {group.totalPcs} pcs · Subtotal {formatRupiah(group.subtotal)} · DP {settings.dp_percent}%{" "}
            {formatRupiah(group.dpAmount)}
          </p>
        </section>
      ))}

      <section aria-labelledby="summary-heading" className="rounded-lg border border-border bg-surface p-4">
        <h2 id="summary-heading">Ringkasan</h2>
        <dl>
          <dt>Total pcs</dt>
          <dd>{cart.totalPcs}</dd>
          <dt>Subtotal</dt>
          <dd>{formatRupiah(cart.subtotal)}</dd>
          <dt>DP {settings.dp_percent}% yang harus dibayar</dt>
          <dd className="font-semibold">{formatRupiah(cart.dpAmount)}</dd>
          <dt>Batas bayar DP</dt>
          <dd>
            {formatDateTime(dpDeadline)} ({settings.dp_window_hours} jam setelah checkout)
          </dd>
        </dl>
        {cart.groups.length > 1 && (
          <p>Keranjang berisi {cart.groups.length} batch PO, jadi akan dibuat {cart.groups.length} pesanan terpisah.</p>
        )}
        <div className="flex flex-wrap items-start gap-3">
          {cart.hasUnavailableItems ? (
            <p role="alert">Hapus barang yang tidak tersedia sebelum checkout.</p>
          ) : (
            <CheckoutDialog
              idempotencyKey={randomUUID()}
              confirmationText={settings.checkout_confirmation_text}
              termsText={settings.order_terms_text}
              dpLabel={formatRupiah(cart.dpAmount)}
              deadlineLabel={formatDateTime(dpDeadline)}
              orderCount={cart.groups.length}
            />
          )}
          <ActionForm
            action={clearCart}
            submitLabel="Kosongkan keranjang"
            pendingLabel="Mengosongkan…"
            confirmMessage="Kosongkan seluruh keranjang?"
            tone="secondary"
          />
        </div>
      </section>
    </main>
  );
};

export default CartPage;
