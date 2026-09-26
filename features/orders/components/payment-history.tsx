import { paymentPurposeLabels, paymentStatusLabels, type Payment } from "@/features/payments/types";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

type PaymentHistoryProps = {
  payments: Payment[];
  proofUrls?: Record<string, string | null>;
};

export const PaymentHistory = ({ payments, proofUrls = {} }: PaymentHistoryProps): React.ReactNode => {
  if (!payments.length) return null;
  return (
    <section aria-labelledby="payments-heading">
      <h2 id="payments-heading">Riwayat pembayaran</h2>
      <ul>
        {payments.map((payment) => (
          <li key={payment.id}>
            {paymentPurposeLabels[payment.purpose]} {formatRupiah(payment.amount)} · {paymentStatusLabels[payment.status]} ·{" "}
            {formatDateTime(payment.createdAt)}
            {payment.rejectReason && <> · Alasan ditolak: {payment.rejectReason}</>}
            {proofUrls[payment.id] && (
              <>
                {" "}
                · <a href={proofUrls[payment.id] ?? undefined}>Lihat bukti</a>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
