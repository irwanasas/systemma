import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { batchStatusLabels, type BatchStatus } from "@/features/catalog/types";
import { createBatch, setBatchStatus } from "@/features/po-batches/server/actions";
import { listBatches, listProductOptions } from "@/features/po-batches/server/queries";
import { getSettings } from "@/features/settings/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";

const nextStatuses: Record<BatchStatus, { status: BatchStatus; label: string }[]> = {
  scheduled: [{ status: "open", label: "Buka" }],
  open: [{ status: "closed", label: "Tutup" }],
  closed: [{ status: "open", label: "Buka lagi" }],
};

const PoBatchesPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const [batches, products, settings] = await Promise.all([listBatches(), listProductOptions(), getSettings()]);
  return (
    <main>
      <h1>Batch PO</h1>
      <section aria-labelledby="batch-list-heading">
        <h2 id="batch-list-heading">Daftar batch</h2>
        {batches.length === 0 ? (
          <p>Belum ada batch.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Seri</th>
                <th scope="col">Batch</th>
                <th scope="col">Status</th>
                <th scope="col">Buka</th>
                <th scope="col">Tutup</th>
                <th scope="col">Estimasi selesai</th>
                <th scope="col">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(({ id, productId, productName, label, status, opensAt, closesAt, etaDays }) => (
                <tr key={id}>
                  <td>
                    <Link href={`/products/${productId}`}>{productName}</Link>
                  </td>
                  <td>{label}</td>
                  <td>{batchStatusLabels[status]}</td>
                  <td>{opensAt ? formatDateTime(opensAt) : "–"}</td>
                  <td>{closesAt ? formatDateTime(closesAt) : "–"}</td>
                  <td>{etaDays} hari setelah DP disetujui</td>
                  <td>
                    {nextStatuses[status].map(({ status: nextStatus, label: actionLabel }) => (
                      <ActionForm
                        key={nextStatus}
                        action={setBatchStatus}
                        submitLabel={`${actionLabel} ${productName} ${label}`} tone="secondary"
                      >
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="status" value={nextStatus} />
                      </ActionForm>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section aria-labelledby="create-batch-heading">
        <h2 id="create-batch-heading">Buat batch</h2>
        <ActionForm action={createBatch} submitLabel="Buat batch" pendingLabel="Membuat…">
          <div>
            <label htmlFor="productId">Seri</label>
            <select id="productId" name="productId" defaultValue="" required>
              <option value="" disabled>
                Pilih seri
              </option>
              {products.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="label">Label (opsional, otomatis B1, B2, …)</label>
            <input id="label" name="label" />
          </div>
          <div>
            <label htmlFor="opensAt">Buka (WIB, opsional)</label>
            <input id="opensAt" name="opensAt" type="datetime-local" />
          </div>
          <div>
            <label htmlFor="closesAt">Tutup (WIB, opsional)</label>
            <input id="closesAt" name="closesAt" type="datetime-local" />
          </div>
          <div>
            <label htmlFor="etaDays">Estimasi selesai (hari setelah DP disetujui)</label>
            <input id="etaDays" name="etaDays" type="number" min={1} defaultValue={settings.eta_days_default} required />
          </div>
        </ActionForm>
      </section>
    </main>
  );
};

export default PoBatchesPage;
