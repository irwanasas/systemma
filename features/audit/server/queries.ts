import "server-only";
import type { Json } from "@/lib/supabase/database.types";
import { getAdminClient } from "@/lib/supabase/admin";

export type AuditLogEntry = {
  id: string;
  actorName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before: Json | null;
  after: Json | null;
  createdAt: string;
};

export const SYSTEM_ACTOR = "system";

export type AuditSearch = {
  entity: string | null;
  actor: string | null;
  actions: string[] | null;
  page: number;
  pageSize: number;
};

export const listAuditLogs = async ({ entity, actor, actions, page, pageSize }: AuditSearch): Promise<{ items: AuditLogEntry[]; total: number }> => {
  if (actions?.length === 0) return { items: [], total: 0 };
  const from = (page - 1) * pageSize;
  let query = getAdminClient()
    .from("audit_logs")
    .select("id, action, entity, entity_id, before, after, created_at, users(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + pageSize - 1);
  if (entity) query = query.eq("entity", entity);
  if (actor === SYSTEM_ACTOR) query = query.is("actor_id", null);
  else if (actor) query = query.eq("actor_id", actor);
  if (actions) query = query.in("action", actions);
  const { data, error, count } = await query;
  if (error) throw error;
  const items = data.map((row) => ({
    id: row.id,
    actorName: row.users?.full_name ?? null,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    before: row.before,
    after: row.after,
    createdAt: row.created_at,
  }));
  return { items, total: count ?? 0 };
};

export const listAuditEntities = async (): Promise<string[]> => {
  const { data, error } = await getAdminClient().from("audit_logs").select("entity").limit(1000);
  if (error) throw error;
  return [...new Set(data.map(({ entity }) => entity))].sort();
};

export type AuditActor = { id: string; name: string };

export const listAuditActors = async (): Promise<AuditActor[]> => {
  const { data, error } = await getAdminClient().from("audit_logs").select("actor_id, users(full_name)").limit(1000);
  if (error) throw error;
  const actors = new Map<string, string>();
  for (const row of data) actors.set(row.actor_id ?? SYSTEM_ACTOR, row.users?.full_name ?? "Sistem");
  return [...actors].map(([id, name]) => ({ id, name })).sort((first, second) => first.name.localeCompare(second.name));
};
