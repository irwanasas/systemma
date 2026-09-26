import { OrderHeader } from "@/features/orders/components/order-header";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { SectionCard } from "@/components/ui/section-card";
import { ActionForm } from "@/components/ui/action-form";
import { CopyButton } from "@/components/ui/copy-button";
import { DpCountdown } from "@/features/orders/components/dp-countdown";
import { InvoiceSection } from "@/features/orders/components/invoice-section";
import { OrderItemsTable } from "@/features/orders/components/order-items-table";
import { OrderStatusTimeline } from "@/features/orders/components/order-status-timeline";
import { PaymentHistory } from "@/features/orders/components/payment-history";
import { cancelOrder } from "@/features/orders/server/actions";
import { type OrderDetail } from "@/features/orders/types";
import { DpProofForm } from "@/features/payments/components/dp-proof-form";
import type { Invoice, Payment } from "@/features/payments/types";
import type { AppSettings } from "@/features/settings/server/queries";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

type AgentOrderDetailProps = {
  order: OrderDetail;
  payments: Payment[];
  invoice: Invoice | null;
  settings: AppSettings;
};

export const AgentOrderDetail = ({ order, payments, invoice, settings }: AgentOrderDetailProps): React.ReactNode => {
  const lastRejected = payments.find(({ purpose, status }) => purpose === "DP" && status === "REJECTED");
  return (
    <main>
      <OrderHeader
        number={order.number}
        meta={[
          {
            label: "Status",
            value: <OrderStatusBadge status={order.status} />,
          },
          {
            label: "Seri",
            value: `${order.productName} · PO ${order.batchLabel}`,
          },
          { label: "Dibuat", value: formatDateTime(order.createdAt) },
          ...(order.etaAt
            ? [
                {
                  label: "Estimasi selesai",
                  value: formatDateTime(order.etaAt),
                },
              ]
            : []),
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          {order.status === "AWAITING_DP" && (
            <SectionCard id="dp-heading" title="Bayar DP" emphasis>
              <DpCountdown dueAt={order.dpDueAt} />
              <p>
                Transfer {formatRupiah(order.dpAmount)} paling lambat <strong>{formatDateTime(order.dpDueAt)}</strong>,
                lalu unggah buktinya. Tanpa bukti, pesanan otomatis kedaluwarsa.
              </p>
              {lastRejected && (
                <p role="alert">
                  Bukti sebelumnya ditolak: {lastRejected.rejectReason}. Silakan unggah bukti yang benar.
                </p>
              )}
              {settings.bank_accounts.length > 0 ? (
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {settings.bank_accounts.map(({ bank, number, holder }) => (
                    <li
                      key={`${bank}-${number}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-ui"
                    >
                      <span>
                        {bank} <span className="font-semibold tabular-nums">{number}</span> a.n. {holder}
                      </span>
                      <CopyButton value={number.replace(/\D/g, "")} label={`Salin nomor rekening ${bank}`} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Rekening tujuan belum diatur. Hubungi admin Aurora.</p>
              )}
              <DpProofForm orderId={order.id} dpAmount={order.dpAmount} />
            </SectionCard>
          )}

          {order.status === "DP_UNDER_REVIEW" && (
            <p role="status">
              Bukti transfer sudah dikirim dan sedang dicek admin. Pesanan aman dari batas waktu sampai selesai dicek.
            </p>
          )}

          <OrderItemsTable order={order} />
          <PaymentHistory payments={payments} />
          <InvoiceSection invoice={invoice} order={order} header={settings.invoice_header} />

          {order.status === "AWAITING_DP" && (
            <SectionCard id="cancel-heading" title="Batalkan pesanan">
              <p className="text-ui text-muted-foreground">Pesanan hanya bisa dibatalkan sebelum bukti DP dikirim.</p>
              <ActionForm
                action={cancelOrder}
                submitLabel="Batalkan pesanan"
                tone="ghost"
                buttonClassName="border border-danger/40 text-danger hover:bg-danger-soft hover:text-danger"
                pendingLabel="Membatalkan…"
                confirmTitle="Batalkan pesanan?"
                confirmMessage={`Pesanan ${order.number} akan dibatalkan dan tidak bisa dikembalikan.`}
              >
                <input type="hidden" name="orderId" value={order.id} />
              </ActionForm>
            </SectionCard>
          )}
        </div>
        <aside className="lg:sticky lg:top-24">
          <OrderStatusTimeline status={order.status} />
        </aside>
      </div>
    </main>
  );
};
