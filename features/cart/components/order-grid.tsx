"use client";

import { startTransition, useActionState, useState } from "react";
import { createStore, useStore } from "zustand";
import { CircleNotch, Minus, Plus } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { saveGrid } from "@/features/cart/server/actions";
import type { FormState } from "@/lib/errors";
import { dpAmountFor, formatRupiah, toRupiah, type Rupiah } from "@/lib/money";

type GridColor = { id: string; name: string };

type GridSize = { sizeCode: string; unitPrice: Rupiah };

type OrderGridProps = {
  poBatchId: string;
  colors: GridColor[];
  sizes: GridSize[];
  variantByCell: Record<string, string>;
  savedQuantities: Record<string, number>;
  dpPercent: number;
};

type GridState = {
  quantities: Record<string, number>;
  setQuantity: (variantId: string, qty: number) => void;
};

const MAX_QTY = 9999;

const toQuantity = (value: string): number => {
  const digits = value.replace(/\D/g, "");
  return digits ? Math.min(Number(digits), MAX_QTY) : 0;
};

const createGridStore = (initial: Record<string, number>) =>
  createStore<GridState>((set) => ({
    quantities: initial,
    setQuantity: (variantId, qty) =>
      set((state) => ({ quantities: { ...state.quantities, [variantId]: Math.max(0, Math.min(qty, MAX_QTY)) } })),
  }));

const initialState: FormState = {};

const moveFocus = (event: React.KeyboardEvent<HTMLInputElement>): void => {
  const offsets: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };
  const offset = offsets[event.key];
  if (!offset) return;
  const { row, col } = event.currentTarget.dataset;
  const grid = event.currentTarget.closest("[data-grid]");
  const target = grid?.querySelector<HTMLInputElement>(
    `[data-row="${Number(row) + offset[0]}"][data-col="${Number(col) + offset[1]}"]`,
  );
  if (!target) return;
  event.preventDefault();
  target.focus();
  target.select();
};

export const OrderGrid = ({ poBatchId, colors, sizes, variantByCell, savedQuantities, dpPercent }: OrderGridProps): React.ReactNode => {
  const [store] = useState(() => createGridStore(savedQuantities));
  const quantities = useStore(store, (state) => state.quantities);
  const setQuantity = useStore(store, (state) => state.setQuantity);
  const [state, formAction, isPending] = useActionState(saveGrid, initialState);

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
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full" aria-busy={isPending}>
      <input type="hidden" name="poBatchId" value={poBatchId} />
      {cells.map(({ variantId }) => (
        <span key={variantId} hidden>
          <input type="hidden" name={`qty:${variantId}`} value={quantities[variantId] ?? 0} />
          <input type="hidden" name={`previous:${variantId}`} value={savedQuantities[variantId] ?? 0} />
        </span>
      ))}

      <div data-grid className="hidden w-fit max-w-full overflow-x-auto rounded-lg border border-border bg-surface md:block">
        <table className="!w-auto">
          <caption className="sr-only">
            Jumlah pcs per warna dan ukuran. Gunakan tombol panah untuk berpindah sel.
          </caption>
          <thead>
            <tr>
              <th scope="col">Warna</th>
              {sizes.map(({ sizeCode, unitPrice }) => (
                <th key={sizeCode} scope="col" className="text-right">
                  <span className="block text-foreground">{sizeCode}</span>
                  <span className="block font-normal">{formatRupiah(unitPrice)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((color, rowIndex) => (
              <tr key={color.id}>
                <th scope="row" className="text-foreground">
                  {color.name}
                </th>
                {sizes.map(({ sizeCode }, colIndex) => {
                  const variantId = variantByCell[`${color.id}:${sizeCode}`];
                  if (!variantId) {
                    return (
                      <td key={sizeCode} className="text-right text-muted-foreground">
                        –
                      </td>
                    );
                  }
                  return (
                    <td key={sizeCode} className="text-right">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        data-row={rowIndex}
                        data-col={colIndex}
                        aria-label={`Jumlah ${color.name} ukuran ${sizeCode}`}
                        value={quantities[variantId] ?? 0}
                        onChange={(event) => setQuantity(variantId, toQuantity(event.target.value))}
                        onFocus={(event) => event.target.select()}
                        onKeyDown={moveFocus}
                        className="!w-20 text-right tabular-nums"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Accordion type="multiple" className="w-full rounded-lg border border-border bg-surface md:hidden">
        {colors.map((color) => {
          const colorPcs = sizes.reduce((sum, { sizeCode }) => {
            const variantId = variantByCell[`${color.id}:${sizeCode}`];
            return sum + (variantId ? (quantities[variantId] ?? 0) : 0);
          }, 0);
          return (
            <AccordionItem key={color.id} value={color.id} className="px-4">
              <AccordionTrigger className="min-h-11 text-base">
                {color.name} · {colorPcs} pcs
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex list-none flex-col gap-2 p-0">
                  {sizes.map(({ sizeCode, unitPrice }) => {
                    const variantId = variantByCell[`${color.id}:${sizeCode}`];
                    if (!variantId) return null;
                    const qty = quantities[variantId] ?? 0;
                    return (
                      <li key={sizeCode} className="flex items-center justify-between gap-3">
                        <span>
                          <span className="font-semibold">{sizeCode}</span>{" "}
                          <span className="text-sm text-muted-foreground">{formatRupiah(unitPrice)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            className="size-11"
                            aria-label={`Kurangi ${color.name} ${sizeCode}`}
                            onClick={() => setQuantity(variantId, qty - 1)}
                            disabled={qty === 0}
                          >
                            <Minus aria-hidden="true" />
                          </Button>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            aria-label={`Jumlah ${color.name} ${sizeCode}`}
                            value={qty}
                            onChange={(event) => setQuantity(variantId, toQuantity(event.target.value))}
                            className="!w-16 text-center tabular-nums"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="size-11"
                            aria-label={`Tambah ${color.name} ${sizeCode}`}
                            onClick={() => setQuantity(variantId, qty + 1)}
                          >
                            <Plus aria-hidden="true" />
                          </Button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div
        data-print="hide"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface py-3"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4">
          <dl className="!flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex gap-2">
              <dt>Total</dt>
              <dd className="font-semibold">{totalPcs} pcs</dd>
            </div>
            <div className="flex gap-2">
              <dt>Subtotal</dt>
              <dd className="font-semibold">{formatRupiah(toRupiah(subtotal))}</dd>
            </div>
            <div className="flex gap-2">
              <dt>DP {dpPercent}%</dt>
              <dd className="font-semibold">{formatRupiah(dpAmountFor(subtotal, dpPercent))}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap items-center gap-3">
            {state.error && <p role="alert">{state.error}</p>}
            {state.message && !hasChanges && <p role="status">{state.message}</p>}
            <Button type="submit" disabled={isPending} className="min-h-11 px-5 font-semibold">
              {isPending && <CircleNotch aria-hidden="true" className="animate-spin" />}
              {isPending ? "Menyimpan…" : "Simpan ke keranjang"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
