"use client";

import { useActionState } from "react";
import { changePassword } from "@/features/auth/server/actions";
import type { FormState } from "@/lib/errors";

const initialState: FormState = {};

export const ChangePasswordForm = (): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(changePassword, initialState);
  return (
    <form action={formAction}>
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
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan…" : "Simpan password"}
      </button>
    </form>
  );
};
