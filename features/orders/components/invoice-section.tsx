import { PrintButton } from "@/components/ui/print-button";
import { SectionCard } from "@/components/ui/section-card";
import type { OrderDetail } from "@/features/orders/types";
import type { Invoice } from "@/features/payments/types";
import type { InvoiceHeader } from "@/features/settings/server/queries";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

type InvoiceSectionProps = {
  invoice: Invoice | null;
  order: OrderDetail;
  header: InvoiceHeader;
};

export const InvoiceSection = ({ invoice, order, header }: InvoiceSectionProps): React.ReactNode => (
  <SectionCard id="invoice-heading" title="Invoice" action={invoice && <PrintButton label="Cetak invoice" />}>
    {invoice ? (
      <>
        <p className="text-ui font-medium">
          {header.name}
          {header.address && ` · ${header.address}`}
        </p>
        <dl className="text-ui">
          <dt>Nomor invoice</dt>
          <dd>{invoice.number}</dd>
          <dt>Diterbitkan</dt>
          <dd>{formatDateTime(invoice.issuedAt)}</dd>
          <dt>Agen</dt>
          <dd>
            {order.agentName} ({order.agentCode})
          </dd>
          <dt>Total</dt>
          <dd>{formatRupiah(order.subtotal)}</dd>
          <dt>DP diterima</dt>
          <dd>{formatRupiah(order.dpAmount)}</dd>
          <dt>Pelunasan</dt>
          <dd>
            {formatRupiah(order.settlementAmount)} —{" "}
            {invoice.settledAt ? `lunas ${formatDateTime(invoice.settledAt)}` : "belum lunas"}
          </dd>
        </dl>
      </>
    ) : (
      <p className="text-ui text-muted-foreground">Invoice terbit setelah DP disetujui admin.</p>
    )}
  </SectionCard>
);
