"use server";

import { revalidatePath } from "next/cache";
import { parseNotificationFilter } from "@/features/notifications/filter";
import { applyNotificationFilter } from "@/features/notifications/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import type { FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

const setReadAt = async (recipientId: string, notificationId: string, readAt: string | null): Promise<void> => {
  const { error } = await getAdminClient()
    .from("notifications")
    .update({ read_at: readAt })
    .eq("id", notificationId)
    .eq("recipient_id", recipientId);
  if (error) throw error;
};

export const markAllNotificationsRead = async (): Promise<FormState> => {
  const user = await requireRole("admin");
  const { error } = await getAdminClient()
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .is("read_at", null);
  if (error) throw error;
  revalidatePath("/", "layout");
  return { message: "Semua notifikasi ditandai sudah dibaca." };
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  const user = await requireRole("admin");
  if (!UUID_PATTERN.test(notificationId)) return;
  await setReadAt(user.id, notificationId, new Date().toISOString());
  revalidatePath("/", "layout");
};

export const setNotificationRead = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("admin");
  const notificationId = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(notificationId)) return { error: "Notifikasi tidak ditemukan." };
  const read = formData.get("read") === "1";
  await setReadAt(user.id, notificationId, read ? new Date().toISOString() : null);
  revalidatePath("/", "layout");
  return {};
};

export const markFilteredNotificationsRead = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("admin");
  const filter = parseNotificationFilter({
    type: String(formData.get("type") ?? ""),
    from: String(formData.get("from") ?? ""),
    to: String(formData.get("to") ?? ""),
  });
  const query = getAdminClient().from("notifications").update({ read_at: new Date().toISOString() });
  const { error } = await applyNotificationFilter(query, user.id, { ...filter, unreadOnly: true });
  if (error) throw error;
  revalidatePath("/", "layout");
  return { message: "Notifikasi pada filter ini ditandai sudah dibaca." };
};
