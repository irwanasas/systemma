import "server-only";
import type { Json } from "@/lib/supabase/database.types";
import { getAdminClient } from "@/lib/supabase/admin";

type AuditEntry = {
  actorId: string;
  action: string;
  entity: string;
  entityId: string | null;
  before?: Json;
  after?: Json;
};

export const recordAudit = async ({ actorId, action, entity, entityId, before, after }: AuditEntry): Promise<void> => {
  const { error } = await getAdminClient()
    .from("audit_logs")
    .insert({ actor_id: actorId, action, entity, entity_id: entityId, before: before ?? null, after: after ?? null });
  if (error) throw error;
};
