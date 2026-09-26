"use client";

import { startTransition, useActionState } from "react";
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
    event.preventDefault();
    if (isPending) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
  return (
    <form onSubmit={handleSubmit}>
      {children}
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
};
