import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

export type AgentListItem = {
  userId: string;
  username: string;
  fullName: string;
  code: string;
  city: string | null;
  phone: string | null;
  isActive: boolean;
  lastOrderAt: string | null;
};

const getLastOrderDates = async (): Promise<Map<string, string>> => {
  const { data, error } = await getAdminClient().from("orders").select("agent_id, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  const lastByAgent = new Map<string, string>();
  for (const { agent_id, created_at } of data) {
    if (!lastByAgent.has(agent_id)) lastByAgent.set(agent_id, created_at);
  }
  return lastByAgent;
};

export const listAgents = async (): Promise<AgentListItem[]> => {
  const [{ data, error }, lastOrderDates] = await Promise.all([
    getAdminClient().from("agents").select("user_id, code, city, users!inner(username, full_name, is_active, phone)").order("code"),
    getLastOrderDates(),
  ]);
  if (error) throw error;
  return data.map(({ user_id, code, city, users }) => ({
    userId: user_id,
    username: users.username,
    fullName: users.full_name,
    code,
    city,
    phone: users.phone,
    isActive: users.is_active,
    lastOrderAt: lastOrderDates.get(user_id) ?? null,
  }));
};
