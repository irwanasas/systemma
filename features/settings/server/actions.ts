"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { firstIssue, type FormState } from "@/lib/errors";
import type { Json } from "@/lib/supabase/database.types";
import { getAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/features/audit/server/record";
import { settingsSections, type SettingsSection } from "@/features/settings/schemas";

const writeSettings = async (actorId: string, values: Record<string, NonNullable<Json>>): Promise<void> => {
  const supabase = getAdminClient();
  const keys = Object.keys(values);
  const { data: before, error: readError } = await supabase.from("app_settings").select("key, value").in("key", keys);
  if (readError) throw readError;
  const { error } = await supabase.from("app_settings").upsert(keys.map((key) => ({ key, value: values[key] })));
  if (error) throw error;
  await recordAudit({
    actorId,
    action: "update_settings",
    entity: "settings",
    entityId: null,
    before: Object.fromEntries(before.map(({ key, value }) => [key, value])),
    after: values,
  });
  revalidatePath("/", "layout");
};

export const saveSettingsSection = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("admin");
  const section = formData.get("section");
  if (typeof section !== "string" || !Object.hasOwn(settingsSections, section)) return { error: "Bagian pengaturan tidak dikenal." };
  const parsed = settingsSections[section as SettingsSection].safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  await writeSettings(user.id, parsed.data as Record<string, NonNullable<Json>>);
  return { message: "Pengaturan disimpan." };
};

const recipientsSchema = z.array(z.uuid());

export const saveNotificationRecipients = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("admin");
  const parsed = recipientsSchema.safeParse(formData.getAll("recipient"));
  if (!parsed.success) return { error: "Pilihan admin tidak valid." };
  const { data: admins, error } = await getAdminClient().from("users").select("id").eq("role", "admin").in("id", parsed.data);
  if (error) throw error;
  await writeSettings(user.id, { notification_recipients: admins.map(({ id }) => id) });
  return { message: parsed.data.length ? "Penerima notifikasi disimpan." : "Semua admin aktif akan menerima notifikasi." };
};
