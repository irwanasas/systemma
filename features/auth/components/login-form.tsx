"use client";

import { useActionState } from "react";
import { login } from "@/features/auth/server/actions";
import type { FormState } from "@/features/auth/types";

const initialState: FormState = {};

export const LoginForm = (): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(login, initialState);
  return (
    <form action={formAction}>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
};
