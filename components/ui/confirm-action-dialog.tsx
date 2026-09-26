"use client";

import { startTransition, useActionState } from "react";
import { CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FormState } from "@/lib/errors";

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  title: string;
  message: string;
  confirmLabel: string;
  pendingLabel?: string;
  destructive?: boolean;
};

const initialState: FormState = {};

const ConfirmActionBody = ({
  onOpenChange,
  action,
  fields,
  message,
  confirmLabel,
  pendingLabel = "Memproses…",
  destructive = false,
}: Omit<ConfirmActionDialogProps, "open" | "title">): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await action(previous, formData);
    if (!result.error && !result.message) onOpenChange(false);
    return result;
  }, initialState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isPending} className="!flex min-h-0 flex-auto !flex-col !items-stretch !gap-0">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <DialogBody className="flex flex-col gap-3">
        {state.message ? (
          <p role="status" className="rounded border-l-4 border-success bg-success-soft px-3 py-2 text-ui">
            {state.message}
          </p>
        ) : (
          <div className="flex items-start gap-3">
            {destructive && <WarningCircle aria-hidden="true" weight="bold" className="mt-0.5 size-5 shrink-0 text-danger" />}
            <DialogDescription className="text-base text-foreground">{message}</DialogDescription>
          </div>
        )}
        {state.error && <p role="alert">{state.error}</p>}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" className="min-h-[var(--control-height)] text-ui" onClick={() => onOpenChange(false)}>
          {state.message ? "Selesai" : "Batal"}
        </Button>
        {!state.message && (
          <Button
            type="submit"
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
            className="min-h-[var(--control-height)] text-ui font-semibold"
          >
            {isPending && <CircleNotch aria-hidden="true" className="animate-spin" />}
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        )}
      </DialogFooter>
    </form>
  );
};

export const ConfirmActionDialog = ({ open, onOpenChange, title, ...bodyProps }: ConfirmActionDialogProps): React.ReactNode => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent role="alertdialog">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <ConfirmActionBody onOpenChange={onOpenChange} {...bodyProps} />
    </DialogContent>
  </Dialog>
);
