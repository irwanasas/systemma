import { UserPlus } from "@phosphor-icons/react/ssr";
import { FormDialog } from "@/components/ui/form-dialog";
import { createAgent } from "@/features/auth/server/actions";

export const CreateAgentForm = (): React.ReactNode => (
  <FormDialog
    action={createAgent}
    triggerLabel="Tambah agen"
    triggerIcon={<UserPlus aria-hidden="true" />}
    title="Tambah agen"
    description="Password awal dibuat otomatis dan hanya ditampilkan sekali."
    submitLabel="Buat agen"
    pendingLabel="Membuat…"
    closeOnSuccess={false}
  >
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="off" required />
      </div>
      <div>
        <label htmlFor="code">Kode agen</label>
        <input id="code" name="code" required />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="fullName">Nama lengkap</label>
        <input id="fullName" name="fullName" required className="!max-w-none" />
      </div>
      <div>
        <label htmlFor="phone">Nomor HP (opsional)</label>
        <input id="phone" name="phone" type="tel" />
      </div>
      <div>
        <label htmlFor="city">Kota (opsional)</label>
        <input id="city" name="city" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="businessName">Nama usaha (opsional)</label>
        <input id="businessName" name="businessName" className="!max-w-none" />
      </div>
    </div>
  </FormDialog>
);
