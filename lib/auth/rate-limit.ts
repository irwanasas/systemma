import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";

const MAX_FAILED_LOGINS = 5;

const WINDOW_MINUTES = 15;

export const getClientIp = async (): Promise<string | null> => {
  const headerStore = await headers();
  const candidate = headerStore.get("x-real-ip") ?? headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return isIP(candidate) ? candidate : null;
};

export const isLoginRateLimited = async (username: string, ip: string | null): Promise<boolean> => {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const query = getAdminClient()
    .from("login_attempts")
    .select("*", { count: "exact", head: true })
    .eq("username", username)
    .eq("succeeded", false)
    .gte("created_at", since);
  const { count, error } = ip ? await query.eq("ip", ip) : await query.is("ip", null);
  if (error) throw error;
  return (count ?? 0) >= MAX_FAILED_LOGINS;
};

export const recordLoginAttempt = async (username: string, ip: string | null, isSuccess: boolean): Promise<void> => {
  const { error } = await getAdminClient().from("login_attempts").insert({ username, ip, succeeded: isSuccess });
  if (error) throw error;
};
