import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { checkout, clearCart, removeCartItem, updateCartLineQty } from "@/features/cart/server/actions";
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
        <section key={group.poBatchId} aria-labelledby={`batch-${group.poBatchId}`}>
          <h2 id={`batch-${group.poBatchId}`}>
            {group.productName} · PO {group.batchLabel}
          </h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Warna</th>
                <th scope="col">Ukuran</th>
                <th scope="col">Harga per pcs</th>
                <th scope="col">Jumlah</th>
                <th scope="col">Total</th>
                <th scope="col">Tindakan</th>
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
                      {!line.isOrderable && <strong> — tidak tersedia, hapus untuk melanjutkan</strong>}
                    </td>
                    <td>{line.unitPrice === null ? "–" : formatRupiah(line.unitPrice)}</td>
                    <td>
                      <ActionForm action={updateCartLineQty} submitLabel="Ubah jumlah" pendingLabel="Menyimpan…">
                        <input type="hidden" name="cartItemId" value={line.id} />
                        <input
                          name="qty"
                          type="number"
                          min={0}
                          defaultValue={line.qty}
                          aria-label={`Jumlah ${line.colorName} ${sizeLabel}`}
                        />
                      </ActionForm>
                    </td>
                    <td>{line.lineTotal === null ? "–" : formatRupiah(line.lineTotal)}</td>
                    <td>
                      <ActionForm
                        action={removeCartItem}
                        submitLabel={`Hapus ${line.colorName} ${sizeLabel}`}
                        pendingLabel="Menghapus…"
                      >
                        <input type="hidden" name="cartItemId" value={line.id} />
                      </ActionForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p>
            {group.totalPcs} pcs · Subtotal {formatRupiah(group.subtotal)} · DP {settings.dp_percent}%{" "}
            {formatRupiah(group.dpAmount)}
          </p>
        </section>
      ))}

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading">Ringkasan</h2>
        <dl>
          <dt>Total pcs</dt>
          <dd>{cart.totalPcs}</dd>
          <dt>Subtotal</dt>
          <dd>{formatRupiah(cart.subtotal)}</dd>
          <dt>DP {settings.dp_percent}% yang harus dibayar</dt>
          <dd>{formatRupiah(cart.dpAmount)}</dd>
        </dl>
        {cart.groups.length > 1 && (
          <p>Keranjang berisi {cart.groups.length} batch PO, jadi akan dibuat {cart.groups.length} pesanan terpisah.</p>
        )}
        <ActionForm
          action={clearCart}
          submitLabel="Kosongkan keranjang"
          pendingLabel="Mengosongkan…"
          confirmMessage="Kosongkan seluruh keranjang?"
        />
      </section>

      <section aria-labelledby="checkout-heading">
        <h2 id="checkout-heading">Checkout</h2>
        <p>
          <strong>{settings.checkout_confirmation_text}</strong>
        </p>
        <p>
          Bayar DP {formatRupiah(cart.dpAmount)} paling lambat {formatDateTime(dpDeadline)} ({settings.dp_window_hours} jam
          setelah checkout) dan unggah bukti transfer. Tanpa bukti, pesanan otomatis kedaluwarsa.
        </p>
        {cart.hasUnavailableItems ? (
          <p role="alert">Hapus barang yang tidak tersedia sebelum checkout.</p>
        ) : (
          <ActionForm action={checkout} submitLabel="Checkout" pendingLabel="Memproses checkout…">
            <input type="hidden" name="idempotencyKey" value={randomUUID()} />
            <div>
              <input id="isConfirmed" name="isConfirmed" type="checkbox" required />
              <label htmlFor="isConfirmed">Saya sudah memastikan pesanan ini benar.</label>
            </div>
          </ActionForm>
        )}
      </section>
    </main>
  );
};

export default CartPage;
