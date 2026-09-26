import { ActionForm } from "@/components/ui/action-form";
import { createAgent } from "@/features/auth/server/actions";

export const CreateAgentForm = (): React.ReactNode => (
  <ActionForm action={createAgent} submitLabel="Buat agen" pendingLabel="Membuat…">
    <div>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" autoComplete="off" required />
    </div>
    <div>
      <label htmlFor="fullName">Nama lengkap</label>
      <input id="fullName" name="fullName" required />
    </div>
    <div>
      <label htmlFor="code">Kode agen</label>
      <input id="code" name="code" required />
    </div>
    <div>
      <label htmlFor="phone">Nomor HP (opsional)</label>
      <input id="phone" name="phone" type="tel" />
    </div>
    <div>
      <label htmlFor="businessName">Nama usaha (opsional)</label>
      <input id="businessName" name="businessName" />
    </div>
    <div>
      <label htmlFor="city">Kota (opsional)</label>
      <input id="city" name="city" />
    </div>
  </ActionForm>
);
