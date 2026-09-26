import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { InvoiceSection } from "@/features/orders/components/invoice-section";
import { OrderItemsTable } from "@/features/orders/components/order-items-table";
import { OrderStatusTimeline } from "@/features/orders/components/order-status-timeline";
import { PaymentHistory } from "@/features/orders/components/payment-history";
import { cancelOrder } from "@/features/orders/server/actions";
import { orderStatusLabels, type OrderDetail } from "@/features/orders/types";
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
      <p>
        <Link href="/orders">Kembali ke daftar pesanan</Link>
      </p>
      <h1>Pesanan {order.number}</h1>
      <dl>
        <dt>Status</dt>
        <dd>{orderStatusLabels[order.status]}</dd>
        <dt>Seri</dt>
        <dd>
          {order.productName} · PO {order.batchLabel}
        </dd>
        <dt>Dibuat</dt>
        <dd>{formatDateTime(order.createdAt)}</dd>
        {order.etaAt && (
          <>
            <dt>Estimasi selesai</dt>
            <dd>{formatDateTime(order.etaAt)}</dd>
          </>
        )}
      </dl>

      {order.status === "AWAITING_DP" && (
        <section aria-labelledby="dp-heading">
          <h2 id="dp-heading">Bayar DP</h2>
          <p>
            Transfer {formatRupiah(order.dpAmount)} paling lambat <strong>{formatDateTime(order.dpDueAt)}</strong>, lalu
            unggah buktinya. Tanpa bukti, pesanan otomatis kedaluwarsa.
          </p>
          {lastRejected && <p role="alert">Bukti sebelumnya ditolak: {lastRejected.rejectReason}. Silakan unggah bukti yang benar.</p>}
          {settings.bank_accounts.length > 0 ? (
            <ul>
              {settings.bank_accounts.map(({ bank, number, holder }) => (
                <li key={`${bank}-${number}`}>
                  {bank} {number} a.n. {holder}
                </li>
              ))}
            </ul>
          ) : (
            <p>Rekening tujuan belum diatur. Hubungi admin Aurora.</p>
          )}
          <DpProofForm orderId={order.id} dpAmount={order.dpAmount} />
        </section>
      )}

      {order.status === "DP_UNDER_REVIEW" && (
        <p role="status">Bukti transfer sudah dikirim dan sedang dicek admin. Pesanan aman dari batas waktu sampai selesai dicek.</p>
      )}

      <OrderStatusTimeline status={order.status} />
      <OrderItemsTable order={order} />
      <PaymentHistory payments={payments} />
      <InvoiceSection invoice={invoice} order={order} header={settings.invoice_header} />

      {order.status === "AWAITING_DP" && (
        <section aria-labelledby="cancel-heading">
          <h2 id="cancel-heading">Batalkan pesanan</h2>
          <p>Pesanan hanya bisa dibatalkan sebelum bukti DP dikirim.</p>
          <ActionForm
            action={cancelOrder}
            submitLabel="Batalkan pesanan"
            pendingLabel="Membatalkan…"
            confirmMessage={`Batalkan pesanan ${order.number}?`}
          >
            <input type="hidden" name="orderId" value={order.id} />
          </ActionForm>
        </section>
      )}
    </main>
  );
};
