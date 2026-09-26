import "server-only";
import { toRupiah } from "@/lib/money";
import { toSearchTerm } from "@/lib/list-params";
import { getAdminClient } from "@/lib/supabase/admin";
import type { OrderDetail, OrderStatus, OrderSummary } from "@/features/orders/types";

const ORDER_SUMMARY_SELECT =
  "id, number, status, subtotal, dp_amount, settlement_amount, dp_due_at, eta_at, created_at, agent_id, dp_received_at, settled_at, shipped_at, po_batches!inner(label, products!inner(name)), agents!inner(code, city, users!inner(full_name, phone))";

type OrderSummaryRow = {
  id: string;
  number: string;
  status: OrderStatus;
  subtotal: number;
  dp_amount: number;
  settlement_amount: number;
  dp_due_at: string;
  eta_at: string | null;
  created_at: string;
  agent_id: string;
  dp_received_at: string | null;
  settled_at: string | null;
  shipped_at: string | null;
  po_batches: { label: string; products: { name: string } };
  agents: { code: string; city: string | null; users: { full_name: string; phone: string | null } };
};

const toOrderSummary = (row: OrderSummaryRow): OrderSummary => ({
  id: row.id,
  number: row.number,
  agentName: row.agents.users.full_name,
  agentCode: row.agents.code,
  status: row.status,
  productName: row.po_batches.products.name,
  batchLabel: row.po_batches.label,
  subtotal: toRupiah(row.subtotal),
  dpAmount: toRupiah(row.dp_amount),
  settlementAmount: toRupiah(row.settlement_amount),
  dpDueAt: row.dp_due_at,
  etaAt: row.eta_at,
  createdAt: row.created_at,
});

export const listAgentOrders = async (agentId: string): Promise<OrderSummary[]> => {
  const { data, error } = await getAdminClient()
    .from("orders")
    .select(ORDER_SUMMARY_SELECT)
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .returns<OrderSummaryRow[]>();
  if (error) throw error;
  return data.map(toOrderSummary);
};

export type OrderSearch = {
  status: OrderStatus | null;
  query: string | undefined;
  page: number;
  pageSize: number;
  agentId?: string;
};

export type OrderSearchResult = { items: OrderSummary[]; total: number };

const findSearchMatches = async (term: string): Promise<{ agentIds: string[]; batchIds: string[] }> => {
  const supabase = getAdminClient();
  const pattern = `%${term}%`;
  const [byCode, byName, products] = await Promise.all([
    supabase.from("agents").select("user_id").ilike("code", pattern),
    supabase.from("users").select("id").eq("role", "agent").ilike("full_name", pattern),
    supabase.from("products").select("id").ilike("name", pattern),
  ]);
  for (const { error } of [byCode, byName, products]) if (error) throw error;
  const productIds = (products.data ?? []).map(({ id }) => id);
  const batches = productIds.length
    ? await supabase.from("po_batches").select("id").in("product_id", productIds)
    : { data: [], error: null };
  if (batches.error) throw batches.error;
  return {
    agentIds: [...new Set([...(byCode.data ?? []).map(({ user_id }) => user_id), ...(byName.data ?? []).map(({ id }) => id)])],
    batchIds: (batches.data ?? []).map(({ id }) => id),
  };
};

export const searchOrders = async ({ status, query, page, pageSize, agentId }: OrderSearch): Promise<OrderSearchResult> => {
  const term = toSearchTerm(query);
  let request = getAdminClient()
    .from("orders")
    .select(ORDER_SUMMARY_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (agentId) request = request.eq("agent_id", agentId);
  if (status) request = request.eq("status", status);
  if (term) {
    const { agentIds, batchIds } = await findSearchMatches(term);
    const filters = [`number.ilike."*${term}*"`];
    if (agentIds.length) filters.push(`agent_id.in.(${agentIds.join(",")})`);
    if (batchIds.length) filters.push(`po_batch_id.in.(${batchIds.join(",")})`);
    request = request.or(filters.join(","));
  }
  const { data, error, count } = await request.returns<OrderSummaryRow[]>();
  if (error) throw error;
  return { items: data.map(toOrderSummary), total: count ?? 0 };
};

export const getOrderDetail = async (orderId: string): Promise<OrderDetail | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const supabase = getAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(ORDER_SUMMARY_SELECT)
    .eq("id", orderId)
    .maybeSingle<OrderSummaryRow>();
  if (error) throw error;
  if (!order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, product_name, color_name, size_code, custom_chest_cm, custom_length_cm, qty, unit_price, line_total")
    .eq("order_id", orderId)
    .order("color_name")
    .order("size_code");
  if (itemsError) throw itemsError;

  return {
    ...toOrderSummary(order),
    agentId: order.agent_id,
    agentPhone: order.agents.users.phone,
    agentCity: order.agents.city,
    dpReceivedAt: order.dp_received_at,
    settledAt: order.settled_at,
    shippedAt: order.shipped_at,
    items: items.map((item) => ({
      id: item.id,
      productName: item.product_name,
      colorName: item.color_name,
      sizeCode: item.size_code,
      customChestCm: item.custom_chest_cm,
      customLengthCm: item.custom_length_cm,
      qty: item.qty,
      unitPrice: toRupiah(item.unit_price),
      lineTotal: toRupiah(item.line_total),
    })),
  };
};
