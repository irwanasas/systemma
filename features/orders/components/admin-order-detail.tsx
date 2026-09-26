import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { OrderHeader } from "@/features/orders/components/order-header";
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
  IN_PRODUCTION: {
    toStatus: "AWAITING_SETTLEMENT",
    label: "Produksi selesai, tagih pelunasan",
  },
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

export const AdminOrderDetail = ({
  order,
  payments,
  proofUrls,
  invoice,
  invoiceHeader,
}: AdminOrderDetailProps): React.ReactNode => {
  const step = nextStep[order.status];
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
            label: "Agen",
            value: (
              <>
                {order.agentName} ({order.agentCode}){order.agentCity && ` · ${order.agentCity}`}
                {order.agentPhone && ` · ${order.agentPhone}`}
              </>
            ),
          },
          {
            label: "Seri",
            value: `${order.productName} · PO ${order.batchLabel}`,
          },
          { label: "Dibuat", value: formatDateTime(order.createdAt) },
          ...(order.status === "AWAITING_DP"
            ? [
                {
                  label: "Batas bayar DP",
                  value: formatDateTime(order.dpDueAt),
                },
              ]
            : []),
          ...(order.dpReceivedAt
            ? [
                {
                  label: "DP disetujui",
                  value: formatDateTime(order.dpReceivedAt),
                },
              ]
            : []),
          ...(order.etaAt
            ? [
                {
                  label: "Estimasi selesai",
                  value: formatDateTime(order.etaAt),
                },
              ]
            : []),
          ...(order.settledAt ? [{ label: "Lunas", value: formatDateTime(order.settledAt) }] : []),
          ...(order.shippedAt ? [{ label: "Dikirim", value: formatDateTime(order.shippedAt) }] : []),
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          {order.status === "DP_UNDER_REVIEW" && (
            <p className="flex max-w-none flex-wrap items-center justify-between gap-3 rounded-xl border border-info/30 bg-info-soft px-4 py-3 text-ui">
              Bukti DP menunggu dicek.
              <Button asChild variant="outline" size="sm" className="min-h-9 text-ui">
                <Link href="/payments" className="text-foreground no-underline">
                  Buka antrean bukti DP
                </Link>
              </Button>
            </p>
          )}

          {order.status === "AWAITING_SETTLEMENT" && (
            <SectionCard id="settlement-heading" title="Pelunasan" emphasis>
              <p className="text-ui">
                Cek mutasi rekening untuk pelunasan {formatRupiah(order.settlementAmount)} dari {order.agentName}.
                Tandai lunas hanya jika dana sudah masuk; pesanan baru bisa dikirim setelah lunas.
              </p>
              <ActionForm
                action={markSettled}
                submitLabel="Tandai pelunasan diterima"
                pendingLabel="Menyimpan…"
                confirmMessage={`Pelunasan ${formatRupiah(order.settlementAmount)} untuk ${order.number} sudah masuk ke rekening?`}
              >
                <input type="hidden" name="orderId" value={order.id} />
              </ActionForm>
            </SectionCard>
          )}

          {step && (
            <SectionCard id="next-step-heading" title="Tahap berikutnya" emphasis>
              <ActionForm action={transitionOrder} submitLabel={step.label} pendingLabel="Menyimpan…">
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="toStatus" value={step.toStatus} />
              </ActionForm>
            </SectionCard>
          )}

          <OrderItemsTable order={order} />
          <PaymentHistory payments={payments} proofUrls={proofUrls} />
          <InvoiceSection invoice={invoice} order={order} header={invoiceHeader} />
        </div>
        <aside className="lg:sticky lg:top-20">
          <OrderStatusTimeline status={order.status} />
        </aside>
      </div>
    </main>
  );
};
