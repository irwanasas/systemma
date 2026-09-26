import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, sessionCookieOptions } from "@/lib/auth/cookie";
import { getAdminClient } from "@/lib/supabase/admin";
import type { CurrentUser } from "@/features/auth/types";

export const createSessionToken = (): string => randomBytes(32).toString("base64url");

export const hashSessionToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const sessionExpiry = (): string => new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

const ABSOLUTE_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export const createSession = async (userId: string, userAgent: string | null): Promise<void> => {
  const token = createSessionToken();
  const { error } = await getAdminClient()
    .from("sessions")
    .insert({ user_id: userId, token_hash: hashSessionToken(token), expires_at: sessionExpiry(), user_agent: userAgent });
  if (error) throw error;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
};

export const destroySession = async (): Promise<void> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  cookieStore.delete(SESSION_COOKIE);
  if (!token) return;
  await getAdminClient().from("sessions").delete().eq("token_hash", hashSessionToken(token));
};

export const deleteUserSessions = async (userId: string, exceptSessionId?: string): Promise<void> => {
  const query = getAdminClient().from("sessions").delete().eq("user_id", userId);
  const { error } = exceptSessionId ? await query.neq("id", exceptSessionId) : await query;
  if (error) throw error;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const supabase = getAdminClient();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("id, expires_at, created_at, users!inner(id, username, role, full_name, is_active, must_change_password)")
    .eq("token_hash", hashSessionToken(token))
    .maybeSingle();
  if (error) throw error;
  if (!session) return null;

  const isPastAbsoluteLifetime = new Date(session.created_at).getTime() + ABSOLUTE_SESSION_LIFETIME_MS <= Date.now();
  if (new Date(session.expires_at) <= new Date() || isPastAbsoluteLifetime) {
    await supabase.from("sessions").delete().eq("id", session.id);
    return null;
  }

  const { users: user } = session;
  if (!user.is_active) return null;

  const { error: renewError } = await supabase
    .from("sessions")
    .update({ expires_at: sessionExpiry(), last_seen_at: new Date().toISOString() })
    .eq("id", session.id);
  if (renewError) throw renewError;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.full_name,
    mustChangePassword: user.must_change_password,
    sessionId: session.id,
  };
});
