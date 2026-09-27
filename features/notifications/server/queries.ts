import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { nextDay } from "@/features/recap/period";
import type { Notification, NotificationFilter, NotificationKind } from "@/features/notifications/types";

type NotificationPayload = {
  order_id?: string;
  order_number?: string;
  agent_name?: string;
  agent_code?: string;
};

const NOTIFICATION_SELECT = "id, kind, payload, read_at, created_at";

type NotificationRow = { id: string; kind: string; payload: unknown; read_at: string | null; created_at: string };

const toNotification = ({ id, kind, payload, read_at, created_at }: NotificationRow): Notification => {
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
};

export const listNotifications = async (recipientId: string, limit = 50): Promise<Notification[]> => {
  const { data, error } = await getAdminClient()
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(toNotification);
};

export const jakartaDayStart = (date: string): string => new Date(`${date}T00:00:00+07:00`).toISOString();

type FilterableQuery<Query> = {
  eq: (column: string, value: string) => Query;
  gte: (column: string, value: string) => Query;
  lt: (column: string, value: string) => Query;
  is: (column: string, value: null) => Query;
};

export const applyNotificationFilter = <Query extends FilterableQuery<Query>>(
  query: Query,
  recipientId: string,
  { kind, from, to, unreadOnly }: NotificationFilter,
): Query => {
  let next = query.eq("recipient_id", recipientId);
  if (kind) next = next.eq("kind", kind);
  if (from) next = next.gte("created_at", jakartaDayStart(from));
  if (to) next = next.lt("created_at", jakartaDayStart(nextDay(to)));
  if (unreadOnly) next = next.is("read_at", null);
  return next;
};

export const searchNotifications = async (
  recipientId: string,
  filter: NotificationFilter,
  page: number,
  pageSize: number,
): Promise<{ items: Notification[]; total: number }> => {
  const query = getAdminClient()
    .from("notifications")
    .select(NOTIFICATION_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await applyNotificationFilter(query, recipientId, filter);
  if (error) throw error;
  return { items: data.map(toNotification), total: count ?? 0 };
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
