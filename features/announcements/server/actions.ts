"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { firstIssue, type FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/features/audit/server/record";
import { announcementIdSchema, announcementSchema } from "@/features/announcements/schemas";

export const createAnnouncement = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("admin");
  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { data, error } = await getAdminClient()
    .from("announcements")
    .insert({ ...parsed.data, author_id: user.id })
    .select("id")
    .single();
  if (error) throw error;
  await recordAudit({ actorId: user.id, action: "create_announcement", entity: "announcement", entityId: data.id, after: parsed.data });

  revalidatePath("/announcements");
  return { message: `Pengumuman “${parsed.data.title}” diterbitkan untuk semua agen.` };
};

export const deleteAnnouncement = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("admin");
  const parsed = announcementIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Pengumuman tidak ditemukan." };

  const { data, error } = await getAdminClient()
    .from("announcements")
    .delete()
    .eq("id", parsed.data.id)
    .select("title, body")
    .maybeSingle();
  if (error) throw error;
  if (data) {
    await recordAudit({ actorId: user.id, action: "delete_announcement", entity: "announcement", entityId: parsed.data.id, before: data });
  }

  revalidatePath("/announcements");
  return {};
};
