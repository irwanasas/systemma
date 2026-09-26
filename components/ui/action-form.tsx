"use client";

import { startTransition, useActionState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/errors";
import { cn } from "@/lib/utils";

type ActionFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  confirmMessage?: string;
  tone?: "primary" | "secondary" | "danger";
  className?: string;
  children?: React.ReactNode;
};

const buttonVariantByTone = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
} as const;

const initialState: FormState = {};

export const ActionForm = ({
  action,
  submitLabel,
  pendingLabel = "Memproses…",
  confirmMessage,
  tone = "primary",
  className,
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
    <form onSubmit={handleSubmit} className={cn(className)} aria-busy={isPending}>
      {children}
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
      <Button
        type="submit"
        variant={buttonVariantByTone[tone]}
        disabled={isPending}
        className="min-h-[var(--control-height)] px-4 text-sm font-semibold"
      >
        {isPending && <CircleNotch aria-hidden="true" className="animate-spin" />}
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
};
