"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import type { FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";

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
