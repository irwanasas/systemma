import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let adminClient: SupabaseClient<Database> | undefined;

export const getAdminClient = (): SupabaseClient<Database> => {
  if (adminClient) return adminClient;
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv();
  adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
};
