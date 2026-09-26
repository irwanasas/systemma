"use client";

import { Minus, Plus } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ColorSwatch } from "@/features/catalog/components/color-swatch";
import { formatRupiah, type Rupiah } from "@/lib/money";

export type GridColor = { id: string; name: string; hex: string | null };

export type GridSize = { sizeCode: string; unitPrice: Rupiah };

export const MAX_QTY = 9999;

export const toQuantity = (value: string): number => {
  const digits = value.replace(/\D/g, "");
  return digits ? Math.min(Number(digits), MAX_QTY) : 0;
};

type OrderGridProps = {
  colors: GridColor[];
  sizes: GridSize[];
  variantByCell: Record<string, string>;
  quantities: Record<string, number>;
  setQuantity: (variantId: string, qty: number) => void;
};

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

const stepperButtonClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

export const OrderGrid = ({ colors, sizes, variantByCell, quantities, setQuantity }: OrderGridProps): React.ReactNode => (
  <>
    <div data-grid className="hidden w-fit max-w-full overflow-x-auto rounded-lg border border-border bg-surface md:block">
      <table className="!w-auto">
        <caption className="sr-only">Jumlah pcs per warna dan ukuran. Gunakan tombol panah untuk berpindah sel.</caption>
        <thead>
          <tr>
            <th scope="col" className="min-w-40">
              Warna
            </th>
            {sizes.map(({ sizeCode, unitPrice }) => (
              <th key={sizeCode} scope="col" className="w-24 min-w-24 text-center">
                <span className="block text-foreground">{sizeCode}</span>
                <span className="block text-xs font-normal">{formatRupiah(unitPrice)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((color, rowIndex) => (
            <tr key={color.id}>
              <th scope="row" className="text-ui font-medium text-foreground">
                <span className="flex items-center gap-2">
                  <ColorSwatch hex={color.hex} />
                  {color.name}
                </span>
              </th>
              {sizes.map(({ sizeCode }, colIndex) => {
                const variantId = variantByCell[`${color.id}:${sizeCode}`];
                if (!variantId) {
                  return (
                    <td key={sizeCode} className="text-center text-muted-foreground">
                      –
                    </td>
                  );
                }
                const qty = quantities[variantId] ?? 0;
                return (
                  <td key={sizeCode} className="px-1.5">
                    <div
                      data-filled={qty > 0 ? "" : undefined}
                      className="mx-auto flex h-8 w-[5.5rem] items-center rounded-md border border-input bg-surface focus-within:ring-[3px] focus-within:ring-ring/50 data-[filled]:border-primary data-[filled]:bg-primary-soft"
                    >
                      <button
                        type="button"
                        data-slot="stepper"
                        tabIndex={-1}
                        aria-label={`Kurangi ${color.name} ukuran ${sizeCode}`}
                        onClick={() => setQuantity(variantId, qty - 1)}
                        disabled={qty === 0}
                        className={stepperButtonClass}
                      >
                        <Minus aria-hidden="true" className="size-3.5" />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        data-row={rowIndex}
                        data-col={colIndex}
                        aria-label={`Jumlah ${color.name} ukuran ${sizeCode}`}
                        value={qty}
                        onChange={(event) => setQuantity(variantId, toQuantity(event.target.value))}
                        onFocus={(event) => event.target.select()}
                        onKeyDown={moveFocus}
                        className="!h-full !min-h-0 !w-full min-w-0 !border-0 !bg-transparent !p-0 text-center text-ui tabular-nums !outline-none"
                      />
                      <button
                        type="button"
                        data-slot="stepper"
                        tabIndex={-1}
                        aria-label={`Tambah ${color.name} ukuran ${sizeCode}`}
                        onClick={() => setQuantity(variantId, qty + 1)}
                        className={stepperButtonClass}
                      >
                        <Plus aria-hidden="true" className="size-3.5" />
                      </button>
                    </div>
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
            <AccordionTrigger className="min-h-11 items-center text-base">
              <span className="flex items-center gap-2">
                <ColorSwatch hex={color.hex} />
                {color.name} · {colorPcs} pcs
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2">
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
  </>
);
