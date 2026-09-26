import { z } from "zod";
import { parseRupiahInput } from "@/lib/money";

export const submitProofSchema = z.object({
  orderId: z.uuid(),
  idempotencyKey: z.uuid(),
  amount: z
    .string()
    .trim()
    .transform((value, context) => {
      const amount = parseRupiahInput(value);
      if (amount === null) {
        context.addIssue({ code: "custom", message: "Isi nominal yang ditransfer, misalnya 250.000." });
        return z.NEVER;
      }
      return amount;
    }),
});

export const reviewSchema = z.object({
  paymentId: z.uuid(),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(500, "Alasan maksimal 500 karakter.").optional(),
});
