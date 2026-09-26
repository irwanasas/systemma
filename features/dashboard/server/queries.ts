import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

export type OrderValueRow = { createdAt: string; subtotal: number };

export const listOrderValues = async (fromIso: string, toExclusiveIso: string): Promise<OrderValueRow[]> => {
  const { data, error } = await getAdminClient()
    .from("orders")
    .select("created_at, subtotal")
    .gte("created_at", fromIso)
    .lt("created_at", toExclusiveIso)
    .not("status", "in", "(CANCELLED,EXPIRED)");
  if (error) throw error;
  return data.map(({ created_at, subtotal }) => ({ createdAt: created_at, subtotal }));
};

export type AttentionCounts = { batchesClosingSoon: number; dpDueToday: number };

export const getAttentionCounts = async (now: Date, endOfTodayIso: string): Promise<AttentionCounts> => {
  const supabase = getAdminClient();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const [batches, dueToday] = await Promise.all([
    supabase
      .from("po_batches")
      .select("*", { count: "exact", head: true })
      .eq("status", "open")
      .gte("closes_at", now.toISOString())
      .lte("closes_at", soon),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "AWAITING_DP")
      .gte("dp_due_at", now.toISOString())
      .lt("dp_due_at", endOfTodayIso),
  ]);
  if (batches.error) throw batches.error;
  if (dueToday.error) throw dueToday.error;
  return { batchesClosingSoon: batches.count ?? 0, dpDueToday: dueToday.count ?? 0 };
};
