import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { reviewDp } from "@/features/payments/server/actions";
import { getPaymentReview, listPendingPayments } from "@/features/payments/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { cn } from "@/lib/utils";
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
      <div className="grid gap-6 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
      <section aria-labelledby="queue-heading" className="flex flex-col gap-3">
        <h2 id="queue-heading">Antrean ({pending.length})</h2>
        {pending.length === 0 ? (
          <p>Tidak ada bukti DP yang menunggu dicek.</p>
        ) : (
          <ul className="flex list-none flex-col gap-1 p-0">
            {pending.map((payment) => {
              const isSelected = payment.id === review?.id;
              return (
                <li key={payment.id}>
                  <Link
                    href={`/payments?id=${payment.id}`}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "flex flex-col rounded-md border px-3 py-2 text-foreground no-underline hover:bg-muted",
                      isSelected ? "border-primary bg-primary-soft" : "border-border bg-surface",
                    )}
                  >
                    <span className="font-semibold">{payment.orderNumber}</span>
                    <span className="text-sm">
                      {payment.agentName} ({payment.agentCode})
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {formatRupiah(payment.amount)} · {formatDateTime(payment.createdAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {review && (
        <section aria-labelledby="review-heading" className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
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
                <a href={review.proofUrl}>Unduh bukti transfer (PDF)</a>
              </p>
            ) : (
              <img
                src={review.proofUrl}
                alt={`Bukti transfer ${review.orderNumber}`}
                className="max-h-[70vh] w-full rounded-md border border-border bg-muted object-contain"
              />
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
          <hr className="w-full border-border" />
          <ActionForm action={reviewDp} submitLabel={`Tolak DP ${review.orderNumber}`} tone="danger" pendingLabel="Menyimpan…">
            <input type="hidden" name="paymentId" value={review.id} />
            <input type="hidden" name="decision" value="reject" />
            <div>
              <label htmlFor="reason">Alasan penolakan (dikirim ke agen)</label>
              <textarea id="reason" name="reason" required maxLength={500} />
            </div>
          </ActionForm>
        </section>
      )}
      </div>
    </main>
  );
};

export default PaymentsPage;
