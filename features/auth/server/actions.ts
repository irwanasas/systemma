"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { generateInitialPassword, hashPassword, verifyPassword } from "@/lib/auth/password";
import { getClientIp, isLoginRateLimited, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { homePathFor, requireRole, requireUser } from "@/lib/auth/require-role";
import { createSession, deleteUserSessions, destroySession } from "@/lib/auth/session";
import { getAdminClient } from "@/lib/supabase/admin";
import { changePasswordSchema, createAgentSchema, loginSchema, userIdSchema } from "@/features/auth/schemas";
import { DB_UNIQUE_VIOLATION, firstIssue, type FormState } from "@/lib/errors";

export const login = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { username, password } = parsed.data;

  const ip = await getClientIp();
  if (await isLoginRateLimited(username, ip)) {
    return { error: "Terlalu banyak percobaan masuk yang gagal. Silakan coba lagi 15 menit lagi." };
  }

  const { data: user, error } = await getAdminClient()
    .from("users")
    .select("id, role, password_hash, is_active, must_change_password")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;

  const isPasswordValid = await verifyPassword(password, user?.password_hash ?? null);
  if (!user || !isPasswordValid) {
    await recordLoginAttempt(username, ip, false);
    return { error: "Username atau password salah." };
  }
  if (!user.is_active) {
    await recordLoginAttempt(username, ip, false);
    return { error: "Akun Anda sudah dinonaktifkan. Silakan hubungi admin Aurora." };
  }

  await recordLoginAttempt(username, ip, true);
  const headerStore = await headers();
  await createSession(user.id, headerStore.get("user-agent"));
  redirect(user.must_change_password ? "/change-password" : homePathFor(user.role));
};

export const logout = async (): Promise<void> => {
  await destroySession();
  redirect("/login");
};

export const changePassword = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { currentPassword, newPassword } = parsed.data;

  const supabase = getAdminClient();
  const { data, error } = await supabase.from("users").select("password_hash").eq("id", user.id).single();
  if (error) throw error;
  if (!(await verifyPassword(currentPassword, data.password_hash))) return { error: "Password lama salah." };

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: await hashPassword(newPassword), must_change_password: false })
    .eq("id", user.id);
  if (updateError) throw updateError;

  await deleteUserSessions(user.id, user.sessionId);
  redirect(homePathFor(user.role));
};

export const createAgent = async (_state: FormState, formData: FormData): Promise<FormState> => {
  await requireRole("admin");
  const parsed = createAgentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { username, fullName, code, phone, businessName, city } = parsed.data;

  const initialPassword = generateInitialPassword();
  const { error } = await getAdminClient().rpc("create_agent", {
    p_username: username,
    p_password_hash: await hashPassword(initialPassword),
    p_full_name: fullName,
    p_code: code,
    p_phone: phone ?? undefined,
    p_business_name: businessName ?? undefined,
    p_city: city ?? undefined,
  });
  if (error?.code === DB_UNIQUE_VIOLATION) return { error: "Username atau kode agen sudah dipakai. Gunakan yang lain." };
  if (error) throw error;

  revalidatePath("/agents");
  return {
    message: `Agen ${username} berhasil dibuat. Password awal: ${initialPassword} — catat sekarang, password ini tidak akan ditampilkan lagi.`,
  };
};

export const deactivateAgent = async (formData: FormData): Promise<void> => {
  await requireRole("admin");
  const parsed = userIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { userId } = parsed.data;

  const { error } = await getAdminClient().from("users").update({ is_active: false }).eq("id", userId).eq("role", "agent");
  if (error) throw error;
  await deleteUserSessions(userId);
  revalidatePath("/agents");
};

export const resetAgentPassword = async (_state: FormState, formData: FormData): Promise<FormState> => {
  await requireRole("admin");
  const parsed = userIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Agen tidak ditemukan." };
  const { userId } = parsed.data;

  const newPassword = generateInitialPassword();
  const { data, error } = await getAdminClient()
    .from("users")
    .update({ password_hash: await hashPassword(newPassword), must_change_password: true })
    .eq("id", userId)
    .eq("role", "agent")
    .select("username")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { error: "Agen tidak ditemukan." };

  await deleteUserSessions(userId);
  return {
    message: `Password baru untuk ${data.username}: ${newPassword} — catat sekarang, password ini tidak akan ditampilkan lagi.`,
  };
};
