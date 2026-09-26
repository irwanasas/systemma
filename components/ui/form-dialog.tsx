"use client";

import { startTransition, useActionState, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FormState } from "@/lib/errors";

type FormDialogProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  title: string;
  description?: string;
  submitLabel: string;
  pendingLabel?: string;
  closeOnSuccess?: boolean;
  children: React.ReactNode;
};

const initialState: FormState = {};

const DialogForm = ({
  action,
  submitLabel,
  pendingLabel = "Menyimpan…",
  closeOnSuccess,
  onDone,
  children,
}: Pick<FormDialogProps, "action" | "submitLabel" | "pendingLabel" | "closeOnSuccess" | "children"> & {
  onDone: () => void;
}): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await action(previous, formData);
    if (!result.error && closeOnSuccess) {
      if (result.message) toast.success(result.message);
      onDone();
    }
    return result;
  }, initialState);

  const isShowingResult = Boolean(state.message && !closeOnSuccess);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={isPending} className="!flex min-h-0 flex-auto !flex-col !items-stretch !gap-0">
      <DialogBody className="flex flex-col gap-4">
        {children}
        {state.error && <p role="alert">{state.error}</p>}
        {isShowingResult && <p role="status">{state.message}</p>}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" className="min-h-[var(--control-height)] text-ui" onClick={onDone}>
          {isShowingResult ? "Selesai" : "Batal"}
        </Button>
        {!isShowingResult && (
          <Button type="submit" disabled={isPending} className="min-h-[var(--control-height)] text-ui font-semibold">
            {isPending && <CircleNotch aria-hidden="true" className="animate-spin" />}
            {isPending ? pendingLabel : submitLabel}
          </Button>
        )}
      </DialogFooter>
    </form>
  );
};

export const FormDialog = ({
  triggerLabel,
  triggerIcon,
  title,
  description,
  closeOnSuccess = true,
  ...formProps
}: FormDialogProps): React.ReactNode => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-[var(--control-height)] text-ui">
          {triggerIcon}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent {...(description ? {} : { "aria-describedby": undefined })}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogForm {...formProps} closeOnSuccess={closeOnSuccess} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
