import { z } from "zod";

const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,32}$/, "Username 3–32 karakter: huruf kecil, angka, titik, strip, atau garis bawah.");

const newPassword = z.string().min(8, "Password baru minimal 8 karakter.").max(72, "Password baru maksimal 72 karakter.");

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

export const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, "Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi."),
    newPassword,
    confirmPassword: z.string(),
  })
  .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
    message: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  })
  .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
    message: "Password baru harus berbeda dari password lama.",
    path: ["newPassword"],
  });

export const createAgentSchema = z.object({
  username,
  fullName: z.string().trim().min(1, "Nama lengkap wajib diisi."),
  code: z.string().trim().toUpperCase().min(1, "Kode agen wajib diisi."),
  phone: optionalText,
  businessName: optionalText,
  city: optionalText,
});

export const userIdSchema = z.object({ userId: z.uuid() });
