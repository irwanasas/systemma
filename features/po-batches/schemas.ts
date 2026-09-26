import { z } from "zod";
import { jakartaInputToIso } from "@/lib/dates";

const optionalJakartaDateTime = (label: string) =>
  z
    .string()
    .trim()
    .transform((value, context) => {
      if (!value) return null;
      const iso = jakartaInputToIso(value);
      if (!iso) {
        context.addIssue({ code: "custom", message: `${label} tidak valid.` });
        return z.NEVER;
      }
      return iso;
    });

export const createBatchSchema = z
  .object({
    productId: z.uuid("Pilih produk."),
    label: z.string().trim(),
    opensAt: optionalJakartaDateTime("Tanggal buka"),
    closesAt: optionalJakartaDateTime("Tanggal tutup"),
    etaDays: z.coerce
      .number({ message: "Estimasi hari harus berupa angka." })
      .int("Estimasi hari harus bilangan bulat.")
      .min(1, "Estimasi hari minimal 1."),
  })
  .refine(({ opensAt, closesAt }) => !opensAt || !closesAt || closesAt > opensAt, {
    message: "Tanggal tutup harus setelah tanggal buka.",
    path: ["closesAt"],
  });

export const batchStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["scheduled", "open", "closed"]),
});
