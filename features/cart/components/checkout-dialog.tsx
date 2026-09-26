"use client";

import { startTransition, useActionState, useState } from "react";
import { CircleNotch, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { checkout } from "@/features/cart/server/actions";
import type { FormState } from "@/lib/errors";

type CheckoutDialogProps = {
  idempotencyKey: string;
  confirmationText: string;
  termsText: string;
  dpLabel: string;
  deadlineLabel: string;
  orderCount: number;
};

const initialState: FormState = {};

export const CheckoutDialog = ({
  idempotencyKey,
  confirmationText,
  termsText,
  dpLabel,
  deadlineLabel,
  orderCount,
}: CheckoutDialogProps): React.ReactNode => {
  const [state, formAction, isPending] = useActionState(checkout, initialState);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending || !isConfirmed) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="min-h-11 px-6 text-base font-semibold">Checkout</Button>
      </DialogTrigger>
      <DialogContent className="bg-surface">
        <form onSubmit={handleSubmit} aria-busy={isPending}>
          <DialogHeader>
            <DialogTitle>Konfirmasi pesanan</DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-start gap-2 rounded-md border-l-4 border-warning bg-warning-soft p-3 text-left text-foreground">
                <Warning aria-hidden="true" weight="bold" className="mt-0.5 shrink-0 text-warning" />
                <p>{confirmationText}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <dl>
            <dt>DP yang harus dibayar</dt>
            <dd className="font-semibold">{dpLabel}</dd>
            <dt>Batas bayar DP</dt>
            <dd className="font-semibold">{deadlineLabel}</dd>
            {orderCount > 1 && (
              <>
                <dt>Jumlah pesanan</dt>
                <dd>{orderCount} pesanan terpisah (satu per batch PO)</dd>
              </>
            )}
          </dl>
          {termsText && <p className="text-sm text-muted-foreground">{termsText}</p>}
          <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
          <div>
            <input
              id="isConfirmed"
              name="isConfirmed"
              type="checkbox"
              checked={isConfirmed}
              onChange={(event) => setIsConfirmed(event.target.checked)}
            />
            <label htmlFor="isConfirmed">Saya sudah memastikan pesanan ini benar.</label>
          </div>
          {state.error && <p role="alert">{state.error}</p>}
          <DialogFooter className="w-full">
            <Button type="submit" disabled={isPending || !isConfirmed} className="min-h-11 px-5 font-semibold">
              {isPending && <CircleNotch aria-hidden="true" className="animate-spin" />}
              {isPending ? "Membuat pesanan…" : "Buat pesanan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
