import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";

const MAX_FAILURES_PER_USERNAME_AND_IP = 5;

const MAX_FAILURES_PER_USERNAME = 20;

const WINDOW_MINUTES = 15;

export const getClientIp = async (): Promise<string | null> => {
  const headerStore = await headers();
  const candidate = headerStore.get("x-real-ip") ?? headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return isIP(candidate) ? candidate : null;
};

type LoginAttempt = {
  attemptId: number;
  isLimited: boolean;
};

const countFailures = async (username: string, ip: string | null | undefined): Promise<number> => {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const query = getAdminClient()
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("username", username)
    .eq("succeeded", false)
    .gte("created_at", since);
  const scoped = ip === undefined ? query : ip === null ? query.is("ip", null) : query.eq("ip", ip);
  const { count, error } = await scoped;
  if (error) throw error;
  return count ?? 0;
};

export const beginLoginAttempt = async (username: string, ip: string | null): Promise<LoginAttempt> => {
  const { data, error } = await getAdminClient()
    .from("login_attempts")
    .insert({ username, ip, succeeded: false })
    .select("id")
    .single();
  if (error) throw error;
  const [pairFailures, usernameFailures] = await Promise.all([countFailures(username, ip), countFailures(username, undefined)]);
  return {
    attemptId: data.id,
    isLimited: pairFailures > MAX_FAILURES_PER_USERNAME_AND_IP || usernameFailures > MAX_FAILURES_PER_USERNAME,
  };
};

export const markLoginAttemptSucceeded = async (attemptId: number): Promise<void> => {
  const { error } = await getAdminClient().from("login_attempts").update({ succeeded: true }).eq("id", attemptId);
  if (error) throw error;
};
