import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Notification, NotificationKind } from "@/features/notifications/types";

type NotificationPayload = {
  order_id?: string;
  order_number?: string;
  agent_name?: string;
  agent_code?: string;
};

export const listNotifications = async (recipientId: string, limit = 50): Promise<Notification[]> => {
  const { data, error } = await getAdminClient()
    .from("notifications")
    .select("id, kind, payload, read_at, created_at")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(({ id, kind, payload, read_at, created_at }) => {
    const details = (payload ?? {}) as NotificationPayload;
    return {
      id,
      kind: kind as NotificationKind,
      orderId: details.order_id ?? null,
      orderNumber: details.order_number ?? null,
      agentName: details.agent_name ?? null,
      agentCode: details.agent_code ?? null,
      isRead: read_at !== null,
      createdAt: created_at,
    };
  });
};

export const countUnreadNotifications = async (recipientId: string): Promise<number> => {
  const { count, error } = await getAdminClient()
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
};

export type DashboardCounts = {
  pendingProofs: number;
  awaitingDp: number;
  inProduction: number;
  awaitingSettlement: number;
};

export const getDashboardCounts = async (): Promise<DashboardCounts> => {
  const supabase = getAdminClient();
  const countOrders = async (status: "AWAITING_DP" | "DP_UNDER_REVIEW" | "IN_PRODUCTION" | "AWAITING_SETTLEMENT"): Promise<number> => {
    const { count, error } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", status);
    if (error) throw error;
    return count ?? 0;
  };
  const [pendingProofs, awaitingDp, inProduction, awaitingSettlement] = await Promise.all([
    countOrders("DP_UNDER_REVIEW"),
    countOrders("AWAITING_DP"),
    countOrders("IN_PRODUCTION"),
    countOrders("AWAITING_SETTLEMENT"),
  ]);
  return { pendingProofs, awaitingDp, inProduction, awaitingSettlement };
};
