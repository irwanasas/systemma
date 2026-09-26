import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

export type AgentListItem = {
  userId: string;
  username: string;
  fullName: string;
  code: string;
  city: string | null;
  isActive: boolean;
};

export const listAgents = async (): Promise<AgentListItem[]> => {
  const { data, error } = await getAdminClient()
    .from("agents")
    .select("user_id, code, city, users!inner(username, full_name, is_active)")
    .order("code");
  if (error) throw error;
  return data.map(({ user_id, code, city, users }) => ({
    userId: user_id,
    username: users.username,
    fullName: users.full_name,
    code,
    city,
    isActive: users.is_active,
  }));
};
