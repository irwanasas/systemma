import "server-only";
import { toRupiah } from "@/lib/money";
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

export const listAllOrders = async (status: OrderStatus | null): Promise<OrderSummary[]> => {
  const query = getAdminClient().from("orders").select(ORDER_SUMMARY_SELECT).order("created_at", { ascending: false }).limit(200);
  const { data, error } = await (status ? query.eq("status", status) : query).returns<OrderSummaryRow[]>();
  if (error) throw error;
  return data.map(toOrderSummary);
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
