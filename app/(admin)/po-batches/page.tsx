import Link from "next/link";
import { CalendarPlus, Plus } from "@phosphor-icons/react/ssr";
import { ActionForm } from "@/components/ui/action-form";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { FormDialog } from "@/components/ui/form-dialog";
import { TableCard } from "@/components/ui/table-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BatchStatusBadge } from "@/features/catalog/components/batch-status-badge";
import type { BatchStatus } from "@/features/catalog/types";
import { createBatch, setBatchStatus } from "@/features/po-batches/server/actions";
import { listBatches, listProductOptions } from "@/features/po-batches/server/queries";
import { getSettings } from "@/features/settings/server/queries";
import { requireRole } from "@/lib/auth/require-role";

const nextStatuses: Record<BatchStatus, { status: BatchStatus; label: string; confirm: boolean }[]> = {
  scheduled: [{ status: "open", label: "Buka", confirm: false }],
  open: [{ status: "closed", label: "Tutup", confirm: true }],
  closed: [{ status: "open", label: "Buka lagi", confirm: false }],
};

const muted = <span className="text-muted-foreground">–</span>;

const PoBatchesPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const [batches, products, settings] = await Promise.all([listBatches(), listProductOptions(), getSettings()]);
  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Batch PO</h1>
        <FormDialog
          action={createBatch}
          triggerLabel="Batch baru"
          triggerIcon={<Plus aria-hidden="true" />}
          title="Buat batch"
          description="Batch baru dibuat dengan status terjadwal. Buka batch agar agen bisa memesan."
          submitLabel="Buat batch"
          pendingLabel="Membuat…"
        >
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="label">Label (opsional)</label>
              <input id="label" name="label" placeholder="Otomatis B1, B2, …" />
            </div>
            <div>
              <label htmlFor="etaDays">Estimasi selesai (hari)</label>
              <input id="etaDays" name="etaDays" type="number" min={1} defaultValue={settings.eta_days_default} required />
            </div>
            <div>
              <label htmlFor="opensAt">Buka (WIB, opsional)</label>
              <input id="opensAt" name="opensAt" type="datetime-local" />
            </div>
            <div>
              <label htmlFor="closesAt">Tutup (WIB, opsional)</label>
              <input id="closesAt" name="closesAt" type="datetime-local" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Estimasi dihitung dari tanggal DP disetujui.</p>
        </FormDialog>
      </div>
      {batches.length === 0 ? (
        <EmptyState icon={CalendarPlus} title="Belum ada batch" description="Buat batch untuk membuka pre-order sebuah seri." />
      ) : (
        <TableCard>
          <table>
            <caption className="sr-only">Daftar batch</caption>
            <thead>
              <tr>
                <th scope="col">Seri</th>
                <th scope="col">Batch</th>
                <th scope="col">Status</th>
                <th scope="col">Buka</th>
                <th scope="col">Tutup</th>
                <th scope="col" className="text-right">
                  Estimasi
                </th>
                <th scope="col">
                  <span className="sr-only">Tindakan</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {batches.map(({ id, productId, productName, label, status, opensAt, closesAt, etaDays }) => (
                <tr key={id}>
                  <td>
                    <Link href={`/products/${productId}`}>{productName}</Link>
                  </td>
                  <td className="font-medium">{label}</td>
                  <td>
                    <BatchStatusBadge status={status} />
                  </td>
                  <td>{opensAt ? <DateTime value={opensAt} /> : muted}</td>
                  <td>{closesAt ? <DateTime value={closesAt} /> : muted}</td>
                  <td className="text-right whitespace-nowrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="cursor-help underline decoration-dotted underline-offset-4">
                          {etaDays} hari<span className="sr-only"> setelah DP disetujui</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Estimasi selesai {etaDays} hari setelah DP disetujui</TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="text-right">
                    {nextStatuses[status].map(({ status: nextStatus, label: actionLabel, confirm }) => (
                      <ActionForm
                        key={nextStatus}
                        action={setBatchStatus}
                        submitLabel={`${actionLabel} ${productName} ${label}`}
                        shortLabel={actionLabel}
                        tone="secondary"
                        className="!items-end"
                        buttonClassName="min-h-9 px-3"
                        confirmTitle={confirm ? "Tutup batch?" : undefined}
                        confirmMessage={
                          confirm ? `Agen tidak bisa memesan ${productName} ${label} lagi setelah batch ditutup.` : undefined
                        }
                        confirmLabel={confirm ? "Tutup batch" : undefined}
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
        </TableCard>
      )}
    </main>
  );
};

export default PoBatchesPage;
