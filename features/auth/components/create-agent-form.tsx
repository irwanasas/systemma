"use client";

import { useActionState } from "react";
import { createAgent } from "@/features/auth/server/actions";
import type { FormState } from "@/features/auth/types";

const initialState: FormState = {};

export const CreateAgentForm = (): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(createAgent, initialState);
  return (
    <form action={formAction}>
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
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Membuat…" : "Buat agen"}
      </button>
    </form>
  );
};
