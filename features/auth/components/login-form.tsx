import { ActionForm } from "@/components/ui/action-form";
import { login } from "@/features/auth/server/actions";

export const LoginForm = (): React.ReactNode => (
  <ActionForm action={login} submitLabel="Masuk">
    <div>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" autoComplete="username" required />
    </div>
    <div>
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
    </div>
  </ActionForm>
);
