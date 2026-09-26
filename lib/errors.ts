import type { z } from "zod";

export type FormState = {
  error?: string;
  message?: string;
};

export const firstIssue = (error: z.ZodError): string => error.issues[0]?.message ?? "Data yang diisi belum benar.";

export const DB_UNIQUE_VIOLATION = "23505";

export const DB_FOREIGN_KEY_VIOLATION = "23503";

export const DB_CHECK_VIOLATION = "23514";
