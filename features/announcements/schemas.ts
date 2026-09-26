import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(120, "Judul maksimal 120 karakter."),
  body: z.string().trim().min(1, "Isi pengumuman wajib diisi.").max(5000, "Isi maksimal 5.000 karakter."),
});

export const announcementIdSchema = z.object({ id: z.uuid() });
