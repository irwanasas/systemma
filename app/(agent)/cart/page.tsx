import { randomUUID } from "node:crypto";
import Link from "next/link";
import { PencilSimple, ShoppingBag, Trash, WarningCircle } from "@phosphor-icons/react/ssr";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { SummaryList } from "@/components/ui/summary-list";
import { CheckoutDialog } from "@/features/cart/components/checkout-dialog";
import { clearCart, removeCartItem, updateCartLineQty } from "@/features/cart/server/actions";
import { getCart } from "@/features/cart/server/queries";
import type { CartLine } from "@/features/cart/types";
import { describeSize } from "@/features/orders/format";
import { getSettings } from "@/features/settings/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime, hoursFromNow } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const CartLineRow = ({ line }: { line: CartLine }): React.ReactNode => {
  const sizeLabel = describeSize(line.sizeCode, line.customChestCm, line.customLengthCm);
  const isCustom = line.variantId === null;
  return (
    <li className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-medium">
          {line.colorName} · {isCustom ? "Custom" : sizeLabel}
        </p>
        {isCustom && <p className="text-sm text-muted-foreground">{sizeLabel.replace(/^Custom \((.*)\)$/, "$1")}</p>}
        <p className="text-sm text-muted-foreground tabular-nums">
          {line.qty} × {line.unitPrice === null ? "–" : formatRupiah(line.unitPrice)}
        </p>
        {!line.isOrderable && (
          <p className="flex items-center gap-1 text-sm font-semibold text-danger">
            <WarningCircle aria-hidden="true" weight="bold" />
            Tidak tersedia, hapus untuk melanjutkan
          </p>
        )}
        {isCustom && line.isOrderable && (
          <ActionForm
            action={updateCartLineQty}
            submitLabel="Simpan"
            pendingLabel="Menyimpan…"
            tone="secondary"
            className="!flex-row !flex-wrap !items-center !gap-2 pt-1"
            buttonClassName="min-h-11 px-3"
          >
            <input type="hidden" name="cartItemId" value={line.id} />
            <input
              name="qty"
              type="number"
              min={0}
              defaultValue={line.qty}
              aria-label={`Jumlah ${line.colorName} ${sizeLabel}`}
              className="!min-h-11 !w-20 tabular-nums"
            />
          </ActionForm>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <p className="font-semibold tabular-nums">{line.lineTotal === null ? "–" : formatRupiah(line.lineTotal)}</p>
        <ActionForm
          action={removeCartItem}
          submitLabel={`Hapus ${line.colorName} ${sizeLabel}`}
          confirmTitle="Hapus dari keranjang?"
          confirmMessage={`${line.colorName} ${sizeLabel}, ${line.qty} pcs akan dihapus dari keranjang.`}
          confirmLabel="Hapus"
          pendingLabel="Menghapus…"
          tone="ghost"
          hideLabel
          icon={<Trash aria-hidden="true" className="size-5" />}
          buttonClassName="size-11 text-muted-foreground hover:text-danger"
        >
          <input type="hidden" name="cartItemId" value={line.id} />
        </ActionForm>
      </div>
    </li>
  );
};

const CartPage = async (): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const [cart, settings] = await Promise.all([getCart(user.id), getSettings()]);

  if (!cart.groups.length) {
    return (
      <main>
        <h1>Keranjang</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Belum ada barang"
          description="Keranjang masih kosong. Pilih seri di katalog untuk mulai memesan."
          action={
            <Button asChild className="min-h-11 text-ui">
              <Link href="/catalog" className="text-primary-foreground no-underline">
                Buka katalog
              </Link>
            </Button>
          }
        />
      </main>
    );
  }

  const dpDeadline = hoursFromNow(settings.dp_window_hours);

  return (
    <main>
      <h1>Keranjang</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-4">
          {cart.groups.map((group) => (
            <SectionCard
              key={group.poBatchId}
              id={`batch-${group.poBatchId}`}
              title={`${group.productName} · PO ${group.batchLabel}`}
              action={
                group.editSlug && (
                  <Button asChild variant="outline" size="sm" className="min-h-11 text-ui">
                    <Link
                      href={`/catalog/${group.editSlug}`}
                      aria-label={`Ubah ${group.productName}`}
                      className="text-foreground no-underline"
                    >
                      <PencilSimple aria-hidden="true" />
                      Ubah
                    </Link>
                  </Button>
                )
              }
            >
              <ul className="divide-y divide-border">
                {group.lines.map((line) => (
                  <CartLineRow key={line.id} line={line} />
                ))}
              </ul>
              <p className="flex max-w-none flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border pt-3 text-ui text-muted-foreground tabular-nums">
                <span>{group.totalPcs} pcs</span>
                <span>
                  Subtotal <span className="font-semibold text-foreground">{formatRupiah(group.subtotal)}</span> · DP{" "}
                  {settings.dp_percent}% {formatRupiah(group.dpAmount)}
                </span>
              </p>
            </SectionCard>
          ))}
        </div>

        <SectionCard id="summary-heading" title="Ringkasan" className="lg:sticky lg:top-24">
          <SummaryList
            rows={[
              { label: "Total pcs", value: cart.totalPcs },
              { label: "Subtotal", value: formatRupiah(cart.subtotal) },
              {
                label: `DP ${settings.dp_percent}% yang harus dibayar`,
                value: formatRupiah(cart.dpAmount),
                strong: true,
              },
            ]}
          />
          <p className="text-sm text-muted-foreground">
            Batas bayar DP {formatDateTime(dpDeadline)} ({settings.dp_window_hours} jam setelah checkout).
          </p>
          {cart.groups.length > 1 && (
            <p className="text-sm text-muted-foreground">
              Keranjang berisi {cart.groups.length} batch PO, jadi akan dibuat {cart.groups.length} pesanan terpisah.
            </p>
          )}
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
            confirmTitle="Kosongkan keranjang?"
            confirmMessage="Semua barang di keranjang akan dihapus."
            tone="ghost"
            className="!items-stretch"
            buttonClassName="text-muted-foreground hover:text-danger"
          />
        </SectionCard>
      </div>
    </main>
  );
};

export default CartPage;
