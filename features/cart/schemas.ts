import { z } from "zod";

const quantity = z.coerce
  .number({ message: "Jumlah harus berupa angka." })
  .int("Jumlah harus bilangan bulat.")
  .min(0, "Jumlah tidak boleh negatif.")
  .max(9999, "Jumlah terlalu besar.");

const centimeters = (label: string, max: number) =>
  z.coerce
    .number({ message: `${label} harus berupa angka.` })
    .gt(0, `${label} harus lebih dari 0 cm.`)
    .max(max, `${label} maksimal ${max} cm.`)
    .refine((value) => Number.isInteger(value * 10), `${label} maksimal satu angka di belakang koma.`);

export const gridSchema = z.object({ poBatchId: z.uuid() });

export const gridCellSchema = z.object({ variantId: z.uuid(), qty: quantity, previousQty: quantity });

export const customItemSchema = z.object({
  poBatchId: z.uuid(),
  colorId: z.uuid("Pilih warna."),
  chestCm: centimeters("Lingkar dada", 140),
  lengthCm: centimeters("Panjang badan", 145),
  qty: quantity.min(1, "Jumlah minimal 1."),
});

export const cartLineQtySchema = z.object({ cartItemId: z.uuid(), qty: quantity });

export const cartItemIdSchema = z.object({ cartItemId: z.uuid() });

export const checkoutSchema = z.object({
  idempotencyKey: z.uuid(),
  isConfirmed: z.literal("on", { message: "Centang konfirmasi bahwa pesanan sudah benar." }),
});
