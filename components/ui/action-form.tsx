"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FormState } from "@/lib/errors";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "danger" | "ghost";

type ActionFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  confirmMessage?: string;
  confirmTitle?: string;
  confirmLabel?: string;
  tone?: Tone;
  icon?: React.ReactNode;
  hideLabel?: boolean;
  className?: string;
  buttonClassName?: string;
  children?: React.ReactNode;
};

const buttonVariantByTone = {
  primary: "default",
  secondary: "outline",
  danger: "destructive",
  ghost: "ghost",
} as const;

const initialState: FormState = {};

export const ActionForm = ({
  action,
  submitLabel,
  pendingLabel = "Memproses…",
  confirmMessage,
  confirmTitle = "Konfirmasi",
  confirmLabel,
  tone = "primary",
  icon,
  hideLabel = false,
  className,
  buttonClassName,
  children,
}: ActionFormProps): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pendingData = useRef<FormData | null>(null);

  const dispatch = (formData: FormData): void => {
    startTransition(() => formAction(formData));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    if (!confirmMessage) {
      dispatch(formData);
      return;
    }
    pendingData.current = formData;
    setIsConfirmOpen(true);
  };

  const handleConfirm = (): void => {
    setIsConfirmOpen(false);
    if (pendingData.current) dispatch(pendingData.current);
  };

  const isDestructive = tone === "danger" || tone === "ghost";

  return (
    <form onSubmit={handleSubmit} className={cn(className)} aria-busy={isPending}>
      {children}
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
      <Button
        type="submit"
        variant={buttonVariantByTone[tone]}
        disabled={isPending}
        aria-label={hideLabel ? submitLabel : undefined}
        title={hideLabel ? submitLabel : undefined}
        className={cn("min-h-[var(--control-height)] px-4 text-ui font-semibold", hideLabel && "px-2", buttonClassName)}
      >
        {isPending ? <CircleNotch aria-hidden="true" className="animate-spin" /> : icon}
        {!hideLabel && (isPending ? pendingLabel : submitLabel)}
      </Button>
      {confirmMessage && (
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent role="alertdialog">
            <DialogHeader>
              <DialogTitle>{confirmTitle}</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex items-start gap-3">
              {isDestructive && <WarningCircle aria-hidden="true" weight="bold" className="mt-0.5 size-5 shrink-0 text-danger" />}
              <DialogDescription className="text-base text-foreground">{confirmMessage}</DialogDescription>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" className="min-h-[var(--control-height)]" onClick={() => setIsConfirmOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                variant={isDestructive ? "destructive" : "default"}
                className="min-h-[var(--control-height)] font-semibold"
                onClick={handleConfirm}
              >
                {confirmLabel ?? submitLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </form>
  );
};
