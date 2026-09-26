import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { reviewDp } from "@/features/payments/server/actions";
import { getPaymentReview, listPendingPayments } from "@/features/payments/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const PaymentsPage = async ({ searchParams }: PageProps<"/payments">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const { id, reviewed, order, at } = await searchParams;
  const pending = await listPendingPayments();
  const selectedId = typeof id === "string" ? id : pending[0]?.id;
  const review = selectedId ? await getPaymentReview(selectedId) : null;

  return (
    <main>
      <h1>Bukti DP</h1>
      {typeof reviewed === "string" && typeof order === "string" && typeof at === "string" && (
        <p role="status">
          DP pesanan {order} {reviewed === "approve" ? "disetujui" : "ditolak"} pada {formatDateTime(at)}.
        </p>
      )}
      <section aria-labelledby="queue-heading">
        <h2 id="queue-heading">Antrean ({pending.length})</h2>
        {pending.length === 0 ? (
          <p>Tidak ada bukti DP yang menunggu dicek.</p>
        ) : (
          <ul>
            {pending.map((payment) => (
              <li key={payment.id} aria-current={payment.id === review?.id ? "true" : undefined}>
                <Link href={`/payments?id=${payment.id}`}>
                  {payment.orderNumber} · {payment.agentName} ({payment.agentCode}) · {formatRupiah(payment.amount)} ·{" "}
                  {formatDateTime(payment.createdAt)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {review && (
        <section aria-labelledby="review-heading">
          <h2 id="review-heading">Periksa {review.orderNumber}</h2>
          <dl>
            <dt>Agen</dt>
            <dd>
              {review.agentName} ({review.agentCode}){review.agentCity && ` · ${review.agentCity}`}
              {review.agentPhone && ` · ${review.agentPhone}`}
            </dd>
            <dt>Seri</dt>
            <dd>
              {review.productName} · PO {review.batchLabel}
            </dd>
            <dt>DP yang harus dibayar</dt>
            <dd>{formatRupiah(review.expectedAmount)}</dd>
            <dt>Nominal menurut agen</dt>
            <dd>
              {formatRupiah(review.amount)}
              {review.amount !== review.expectedAmount && <strong> — berbeda dari DP yang harus dibayar</strong>}
            </dd>
            <dt>Dikirim</dt>
            <dd>{formatDateTime(review.createdAt)}</dd>
          </dl>
          {review.proofUrl ? (
            review.isPdf ? (
              <p>
                <a href={review.proofUrl}>Buka bukti transfer (PDF)</a>
              </p>
            ) : (
              <p>
                <img src={review.proofUrl} alt={`Bukti transfer ${review.orderNumber}`} />
              </p>
            )
          ) : (
            <p role="alert">File bukti tidak bisa dibuka. Minta agen mengunggah ulang dengan menolak bukti ini.</p>
          )}
          <p>Cocokkan nominal dan nama pengirim dengan mutasi rekening sebelum menyetujui.</p>
          <ActionForm
            action={reviewDp}
            submitLabel={`Setujui DP ${review.orderNumber}`}
            pendingLabel="Menyimpan…"
            confirmMessage={`Setujui DP ${review.orderNumber}? Setelah disetujui, pesanan terkunci dan invoice terbit.`}
          >
            <input type="hidden" name="paymentId" value={review.id} />
            <input type="hidden" name="decision" value="approve" />
          </ActionForm>
          <ActionForm action={reviewDp} submitLabel={`Tolak DP ${review.orderNumber}`} pendingLabel="Menyimpan…">
            <input type="hidden" name="paymentId" value={review.id} />
            <input type="hidden" name="decision" value="reject" />
            <div>
              <label htmlFor="reason">Alasan penolakan (dikirim ke agen)</label>
              <textarea id="reason" name="reason" required maxLength={500} />
            </div>
          </ActionForm>
        </section>
      )}
    </main>
  );
};

export default PaymentsPage;
