"use client";

import { startTransition, useActionState, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStore, useStore } from "zustand";
import { CaretDown, CircleNotch } from "@phosphor-icons/react";
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
import { CustomSizeForm } from "@/features/cart/components/custom-size-form";
import { OrderGrid, MAX_QTY, type GridColor, type GridSize } from "@/features/cart/components/order-grid";
import { saveGrid } from "@/features/cart/server/actions";
import { ColorSwatch } from "@/features/catalog/components/color-swatch";
import { formatDateTime, formatShortDateTime } from "@/lib/dates";
import type { FormState } from "@/lib/errors";
import { dpAmountFor, formatRupiah, toRupiah, type Rupiah } from "@/lib/money";

export type OrderPanelData = {
  poBatchId: string;
  colors: GridColor[];
  sizes: GridSize[];
  variantByCell: Record<string, string>;
  savedQuantities: Record<string, number>;
  dpPercent: number;
  custom: { unitPrice: Rupiah; chestMaxCm: number; lengthMaxCm: number } | null;
};

export type OrderPanelHeader = {
  slug: string;
  name: string;
  categoryName: string;
  batchLabel: string;
  closesAt: string | null;
};

type GridState = {
  quantities: Record<string, number>;
  setQuantity: (variantId: string, qty: number) => void;
};

const createGridStore = (initial: Record<string, number>) =>
  createStore<GridState>((set) => ({
    quantities: initial,
    setQuantity: (variantId, qty) =>
      set((state) => ({ quantities: { ...state.quantities, [variantId]: Math.max(0, Math.min(qty, MAX_QTY)) } })),
  }));

const initialState: FormState = {};

type OrderPanelProps = {
  data: OrderPanelData;
  variant: "page" | "modal";
  header?: OrderPanelHeader;
};

export const OrderPanel = ({ data, variant, header }: OrderPanelProps): React.ReactNode => {
  const { poBatchId, colors, sizes, variantByCell, savedQuantities, dpPercent, custom } = data;
  const router = useRouter();
  const formId = useId();
  const [store] = useState(() => createGridStore(savedQuantities));
  const quantities = useStore(store, (state) => state.quantities);
  const setQuantity = useStore(store, (state) => state.setQuantity);
  const [customDirty, setCustomDirty] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [open, setOpen] = useState(true);
  const isEditing = Object.values(savedQuantities).some((qty) => qty > 0);

  const [state, formAction, isPending] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await saveGrid(previous, formData);
    if (!result.error && result.message && variant === "modal") {
      toast.success(result.message, { id: "cart-updated", action: { label: "Lihat keranjang", onClick: () => router.push("/cart") } });
      setOpen(false);
    }
    return result;
  }, initialState);

  const priceBySize = new Map(sizes.map(({ sizeCode, unitPrice }) => [sizeCode, unitPrice]));
  const cells = colors.flatMap((color) =>
    sizes.flatMap(({ sizeCode }) => {
      const variantId = variantByCell[`${color.id}:${sizeCode}`];
      return variantId ? [{ variantId, sizeCode }] : [];
    }),
  );
  const totalPcs = cells.reduce((sum, { variantId }) => sum + (quantities[variantId] ?? 0), 0);
  const subtotal = cells.reduce(
    (sum, { variantId, sizeCode }) => sum + (quantities[variantId] ?? 0) * (priceBySize.get(sizeCode) ?? 0),
    0,
  );
  const hasChanges = cells.some(({ variantId }) => (quantities[variantId] ?? 0) !== (savedQuantities[variantId] ?? 0));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending || !hasChanges) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  const requestClose = (): void => {
    if (isPending) return;
    if (hasChanges || customDirty) setConfirmingDiscard(true);
    else setOpen(false);
  };

  const handleCloseAutoFocus = (event: Event): void => {
    event.preventDefault();
    router.back();
    document.querySelector<HTMLElement>(`main a[href="/catalog/${header?.slug}"]`)?.focus();
  };

  const gridForm = (
    <form id={formId} onSubmit={handleSubmit} className="w-full" aria-busy={isPending}>
      <input type="hidden" name="poBatchId" value={poBatchId} />
      {cells.map(({ variantId }) => (
        <span key={variantId} hidden>
          <input type="hidden" name={`qty:${variantId}`} value={quantities[variantId] ?? 0} />
          <input type="hidden" name={`previous:${variantId}`} value={savedQuantities[variantId] ?? 0} />
        </span>
      ))}
      <OrderGrid
        colors={colors}
        sizes={sizes}
        variantByCell={variantByCell}
        quantities={quantities}
        setQuantity={setQuantity}
      />
    </form>
  );

  const customSection = custom && (
    <details className="group w-full rounded-lg border border-border bg-surface">
      <summary className="flex min-h-11 list-none items-center justify-between gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className="font-semibold">Tambah ukuran custom</span>
          <span className="text-sm text-muted-foreground">{formatRupiah(custom.unitPrice)} per pcs</span>
        </span>
        <CaretDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border p-4">
        <CustomSizeForm
          poBatchId={poBatchId}
          colors={colors}
          chestMaxCm={custom.chestMaxCm}
          lengthMaxCm={custom.lengthMaxCm}
          onDirtyChange={setCustomDirty}
        />
      </div>
    </details>
  );

  const submitLabel = isEditing ? "Simpan perubahan" : "Tambah ke keranjang";

  const footerContent = (
    <>
      <dl className="!flex flex-wrap gap-x-5 gap-y-1 text-ui">
        <div className="flex gap-1.5">
          <dt>Total</dt>
          <dd className="font-semibold">{totalPcs} pcs</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Subtotal</dt>
          <dd className="font-semibold">{formatRupiah(toRupiah(subtotal))}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>DP {dpPercent}%</dt>
          <dd className="font-semibold">{formatRupiah(dpAmountFor(subtotal, dpPercent))}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center justify-end gap-3 max-sm:w-full">
        {state.error && (
          <p role="alert" className="rounded border-l-4 border-danger bg-danger-soft px-3 py-2 text-ui text-danger">
            {state.error}
          </p>
        )}
        {variant === "page" && state.message && !hasChanges && <p role="status">{state.message}</p>}
        <Button type="submit" form={formId} disabled={isPending || !hasChanges} className="min-h-11 px-5 text-ui font-semibold max-sm:w-full">
          {isPending && <CircleNotch aria-hidden="true" className="animate-spin" />}
          {isPending ? "Menyimpan…" : submitLabel}
        </Button>
      </div>
    </>
  );

  if (variant === "page") {
    return (
      <>
        <div className="flex flex-col gap-4 pb-24">
          {gridForm}
          {customSection}
        </div>
        <div data-print="hide" className="fixed inset-x-0 bottom-[calc(3.5rem+1px+env(safe-area-inset-bottom))] z-20 border-t border-border bg-surface py-3 md:bottom-0">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4">{footerContent}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && requestClose()}>
        <DialogContent size="lg" aria-describedby={undefined} onCloseAutoFocus={handleCloseAutoFocus}>
          <DialogHeader onClose={requestClose}>
            <p className="text-sm font-medium text-muted-foreground">
              {header?.categoryName} · PO {header?.batchLabel}
              {header?.closesAt && (
                <>
                  {" "}
                  · Ditutup{" "}
                  <time dateTime={header.closesAt} title={formatDateTime(header.closesAt)}>
                    {formatShortDateTime(header.closesAt)}
                  </time>
                </>
              )}
            </p>
            <DialogTitle>{header?.name}</DialogTitle>
            <span className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
              {colors.map(({ id, hex }) => (
                <ColorSwatch key={id} hex={hex} />
              ))}
            </span>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <p className="text-ui text-muted-foreground">Harga hanya ditentukan ukuran; semua warna sama.</p>
            {gridForm}
            {customSection}
          </DialogBody>
          <DialogFooter className="justify-between">{footerContent}</DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmingDiscard} onOpenChange={setConfirmingDiscard}>
        <DialogContent role="alertdialog" aria-describedby="discard-description">
          <DialogHeader>
            <DialogTitle>Buang perubahan?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription id="discard-description">
              Jumlah yang sudah diisi belum disimpan ke keranjang dan akan hilang.
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" className="text-ui" onClick={() => setConfirmingDiscard(false)}>
              Lanjut mengisi
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="text-ui"
              onClick={() => {
                setConfirmingDiscard(false);
                setOpen(false);
              }}
            >
              Buang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
