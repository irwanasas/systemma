import { z } from "zod";
import { parseRupiahInput } from "@/lib/money";
import { PRODUCT_STATUSES, SIZE_CODES } from "@/features/catalog/types";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

const optionalRupiah = (label: string) =>
  z
    .string()
    .trim()
    .transform((value, context) => {
      if (!value) return null;
      const amount = parseRupiahInput(value);
      if (amount === null) {
        context.addIssue({ code: "custom", message: `${label} harus berupa angka rupiah tanpa desimal, misalnya 250.000.` });
        return z.NEVER;
      }
      return amount;
    });

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Nama seri wajib diisi."),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip, misalnya sevina-polka."),
    categoryId: z.uuid("Pilih kategori."),
    description: optionalText,
    status: z.enum(PRODUCT_STATUSES),
    customSizeEnabled: z
      .string()
      .optional()
      .transform((value) => value === "on"),
    customUnitPrice: optionalRupiah("Harga custom"),
  })
  .refine(({ customSizeEnabled, customUnitPrice }) => !customSizeEnabled || customUnitPrice !== null, {
    message: "Isi harga custom jika custom ukuran diaktifkan.",
    path: ["customUnitPrice"],
  });

export const sizePricesSchema = z.object(
  Object.fromEntries(SIZE_CODES.map((sizeCode) => [sizeCode, optionalRupiah(`Harga ukuran ${sizeCode}`)])) as Record<
    (typeof SIZE_CODES)[number],
    ReturnType<typeof optionalRupiah>
  >,
);

export const colorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama warna wajib diisi.")
    .regex(/[a-zA-Z0-9]/, "Nama warna harus mengandung huruf atau angka."),
  hex: z
    .string()
    .trim()
    .transform((value) => value || null)
    .refine((value) => value === null || /^#[0-9A-Fa-f]{6}$/.test(value), "Kode warna harus seperti #A1B2C3."),
});

export const idSchema = z.object({ id: z.uuid() });
