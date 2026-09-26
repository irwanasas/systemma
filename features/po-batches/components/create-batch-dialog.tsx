import { Plus } from "@phosphor-icons/react/ssr";
import { FormDialog } from "@/components/ui/form-dialog";
import { createBatch } from "@/features/po-batches/server/actions";

type CreateBatchDialogProps = {
  products: { id: string; name: string }[];
  etaDaysDefault: number;
  triggerVariant?: "default" | "outline";
  triggerLabel?: string;
};

export const CreateBatchDialog = ({
  products,
  etaDaysDefault,
  triggerVariant = "default",
  triggerLabel = "Batch baru",
}: CreateBatchDialogProps): React.ReactNode => (
  <FormDialog
    triggerVariant={triggerVariant}
    action={createBatch}
    triggerLabel={triggerLabel}
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
        <input id="etaDays" name="etaDays" type="number" min={1} defaultValue={etaDaysDefault} required />
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
);
