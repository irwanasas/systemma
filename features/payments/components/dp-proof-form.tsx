import { randomUUID } from "node:crypto";
import { ActionForm } from "@/components/ui/action-form";
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
    <div>
      <label htmlFor="proof">Foto atau file bukti transfer (JPG, PNG, WEBP, atau PDF, maks. 5 MB)</label>
      <input id="proof" name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required />
    </div>
    <div>
      <label htmlFor="amount">Nominal yang ditransfer (Rp)</label>
      <input id="amount" name="amount" inputMode="numeric" defaultValue={dpAmount} required />
    </div>
  </ActionForm>
);
