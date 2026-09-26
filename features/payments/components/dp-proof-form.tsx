import { randomUUID } from "node:crypto";
import { ActionForm } from "@/components/ui/action-form";
import { FileField } from "@/components/ui/file-field";
import { submitDpProof } from "@/features/payments/server/actions";
import type { Rupiah } from "@/lib/money";

type DpProofFormProps = {
  orderId: string;
  dpAmount: Rupiah;
};

export const DpProofForm = ({ orderId, dpAmount }: DpProofFormProps): React.ReactNode => (
  <ActionForm action={submitDpProof} submitLabel="Kirim bukti transfer" pendingLabel="Mengunggah…">
    <input type="hidden" name="orderId" value={orderId} />
    <input type="hidden" name="idempotencyKey" value={randomUUID()} />
    <FileField
      id="proof"
      name="proof"
      label="Foto atau file bukti transfer (JPG, PNG, WEBP, atau PDF, maks. 5 MB)"
      accept="image/jpeg,image/png,image/webp,application/pdf"
      required
    />
    <div>
      <label htmlFor="amount">Nominal yang ditransfer (Rp)</label>
      <input id="amount" name="amount" inputMode="numeric" defaultValue={dpAmount} required />
    </div>
  </ActionForm>
);
