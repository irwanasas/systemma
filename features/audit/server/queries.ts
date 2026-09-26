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

export const AUDIT_PAGE_SIZE = 100;

export const SYSTEM_ACTOR = "system";

export const listAuditLogs = async (entity: string | null, actor: string | null, page: number): Promise<AuditLogEntry[]> => {
  const from = page * AUDIT_PAGE_SIZE;
  let query = getAdminClient()
    .from("audit_logs")
    .select("id, action, entity, entity_id, before, after, created_at, users(full_name)")
    .order("created_at", { ascending: false })
    .range(from, from + AUDIT_PAGE_SIZE - 1);
  if (entity) query = query.eq("entity", entity);
  if (actor === SYSTEM_ACTOR) query = query.is("actor_id", null);
  else if (actor) query = query.eq("actor_id", actor);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    actorName: row.users?.full_name ?? null,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    before: row.before,
    after: row.after,
    createdAt: row.created_at,
  }));
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
