import { ArrowDownLeft, CheckCircle, Clock, XCircle } from "@phosphor-icons/react/ssr";
import { paymentPurposeLabels, paymentStatusLabels, type Payment, type PaymentStatus } from "@/features/payments/types";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const statusIcon: Record<PaymentStatus, typeof CheckCircle> = {
  PENDING: Clock,
  VERIFIED: CheckCircle,
  REJECTED: XCircle,
};

type PaymentHistoryProps = {
  payments: Payment[];
  proofUrls?: Record<string, string | null>;
};

export const PaymentHistory = ({ payments, proofUrls = {} }: PaymentHistoryProps): React.ReactNode => {
  if (!payments.length) return null;
  return (
    <section aria-labelledby="payments-heading" className="rounded-lg border border-border bg-surface p-4">
      <h2 id="payments-heading">Riwayat pembayaran</h2>
      <ul className="flex list-none flex-col gap-3 p-0">
        {payments.map((payment) => {
          const StatusIcon = statusIcon[payment.status];
          return (
            <li key={payment.id} className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="flex flex-wrap items-center gap-2">
                <ArrowDownLeft aria-hidden="true" weight="bold" />
                <span className="font-semibold">{paymentPurposeLabels[payment.purpose]}</span>
                <span className="tabular-nums">+{formatRupiah(payment.amount)}</span>
                <span className="inline-flex items-center gap-1">
                  <StatusIcon aria-hidden="true" weight="bold" />
                  {paymentStatusLabels[payment.status]}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(payment.createdAt)}
                {proofUrls[payment.id] && (
                  <>
                    {" "}
                    · <a href={proofUrls[payment.id] ?? undefined}>Lihat bukti</a>
                  </>
                )}
              </span>
              {payment.rejectReason && <span className="text-sm">Alasan ditolak: {payment.rejectReason}</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
