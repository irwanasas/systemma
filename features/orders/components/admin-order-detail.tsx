import Link from "next/link";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ActionForm } from "@/components/ui/action-form";
import { InvoiceSection } from "@/features/orders/components/invoice-section";
import { OrderItemsTable } from "@/features/orders/components/order-items-table";
import { OrderStatusTimeline } from "@/features/orders/components/order-status-timeline";
import { PaymentHistory } from "@/features/orders/components/payment-history";
import { markSettled, transitionOrder } from "@/features/orders/server/actions";
import { type OrderDetail, type OrderStatus } from "@/features/orders/types";
import type { Invoice, Payment } from "@/features/payments/types";
import type { InvoiceHeader } from "@/features/settings/server/queries";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const nextStep: Partial<Record<OrderStatus, { toStatus: OrderStatus; label: string }>> = {
  DP_RECEIVED: { toStatus: "IN_PRODUCTION", label: "Mulai produksi" },
  IN_PRODUCTION: { toStatus: "AWAITING_SETTLEMENT", label: "Produksi selesai, tagih pelunasan" },
  SETTLED: { toStatus: "SHIPPED", label: "Tandai sudah dikirim" },
  SHIPPED: { toStatus: "COMPLETED", label: "Tandai selesai" },
};

type AdminOrderDetailProps = {
  order: OrderDetail;
  payments: Payment[];
  proofUrls: Record<string, string | null>;
  invoice: Invoice | null;
  invoiceHeader: InvoiceHeader;
};

export const AdminOrderDetail = ({ order, payments, proofUrls, invoice, invoiceHeader }: AdminOrderDetailProps): React.ReactNode => {
  const step = nextStep[order.status];
  return (
    <main>
      <p>
        <Link href="/orders">Kembali ke daftar pesanan</Link>
      </p>
      <h1>Pesanan {order.number}</h1>
      <dl>
        <dt>Status</dt>
        <dd><OrderStatusBadge status={order.status} /></dd>
        <dt>Agen</dt>
        <dd>
          {order.agentName} ({order.agentCode}){order.agentCity && ` · ${order.agentCity}`}
          {order.agentPhone && ` · ${order.agentPhone}`}
        </dd>
        <dt>Seri</dt>
        <dd>
          {order.productName} · PO {order.batchLabel}
        </dd>
        <dt>Dibuat</dt>
        <dd>{formatDateTime(order.createdAt)}</dd>
        {order.status === "AWAITING_DP" && (
          <>
            <dt>Batas bayar DP</dt>
            <dd>{formatDateTime(order.dpDueAt)}</dd>
          </>
        )}
        {order.dpReceivedAt && (
          <>
            <dt>DP disetujui</dt>
            <dd>{formatDateTime(order.dpReceivedAt)}</dd>
          </>
        )}
        {order.etaAt && (
          <>
            <dt>Estimasi selesai</dt>
            <dd>{formatDateTime(order.etaAt)}</dd>
          </>
        )}
        {order.settledAt && (
          <>
            <dt>Lunas</dt>
            <dd>{formatDateTime(order.settledAt)}</dd>
          </>
        )}
        {order.shippedAt && (
          <>
            <dt>Dikirim</dt>
            <dd>{formatDateTime(order.shippedAt)}</dd>
          </>
        )}
      </dl>

      {order.status === "DP_UNDER_REVIEW" && (
        <p>
          Bukti DP menunggu dicek. <Link href="/payments">Buka antrean bukti DP</Link>
        </p>
      )}

      {order.status === "AWAITING_SETTLEMENT" && (
        <section aria-labelledby="settlement-heading" className="rounded-lg border-2 border-primary bg-surface p-4">
          <h2 id="settlement-heading">Pelunasan</h2>
          <p>
            Cek mutasi rekening untuk pelunasan {formatRupiah(order.settlementAmount)} dari {order.agentName}. Tandai lunas
            hanya jika dana sudah masuk; pesanan baru bisa dikirim setelah lunas.
          </p>
          <ActionForm
            action={markSettled}
            submitLabel="Tandai pelunasan diterima"
            pendingLabel="Menyimpan…"
            confirmMessage={`Pelunasan ${formatRupiah(order.settlementAmount)} untuk ${order.number} sudah masuk ke rekening?`}
          >
            <input type="hidden" name="orderId" value={order.id} />
          </ActionForm>
        </section>
      )}

      {step && (
        <section aria-labelledby="next-step-heading" className="rounded-lg border-2 border-primary bg-surface p-4">
          <h2 id="next-step-heading">Tahap berikutnya</h2>
          <ActionForm action={transitionOrder} submitLabel={step.label} pendingLabel="Menyimpan…">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="toStatus" value={step.toStatus} />
          </ActionForm>
        </section>
      )}

      <OrderStatusTimeline status={order.status} />
      <OrderItemsTable order={order} />
      <PaymentHistory payments={payments} proofUrls={proofUrls} />
      <InvoiceSection invoice={invoice} order={order} header={invoiceHeader} />
    </main>
  );
};
