"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/errors";

type ActionFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  confirmMessage?: string;
  children?: React.ReactNode;
};

const initialState: FormState = {};

export const ActionForm = ({
  action,
  submitLabel,
  pendingLabel = "Memproses…",
  confirmMessage,
  children,
}: ActionFormProps): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
  };
  return (
    <form action={formAction} onSubmit={handleSubmit}>
      {children}
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
};
