import { ActionForm } from "@/components/ui/action-form";
import { changePassword } from "@/features/auth/server/actions";

export const ChangePasswordForm = (): React.ReactNode => (
  <ActionForm action={changePassword} submitLabel="Simpan password" pendingLabel="Menyimpan…">
    <div>
      <label htmlFor="currentPassword">Password lama</label>
      <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
    </div>
    <div>
      <label htmlFor="newPassword">Password baru</label>
      <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
    </div>
    <div>
      <label htmlFor="confirmPassword">Ulangi password baru</label>
      <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
    </div>
  </ActionForm>
);
