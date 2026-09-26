import "server-only";
import { toRupiah } from "@/lib/money";
import { getAdminClient } from "@/lib/supabase/admin";
import type { RecapPeriod } from "@/features/recap/period";
import type { RecapRow } from "@/features/recap/types";

export const getRecapRows = async ({ fromIso, toExclusiveIso }: RecapPeriod): Promise<RecapRow[]> => {
  const { data, error } = await getAdminClient().rpc("recap_by_agent_series", { p_from: fromIso, p_to: toExclusiveIso });
  if (error) throw error;
  return data.map((row) => ({
    agentId: row.agent_id,
    agentCode: row.agent_code,
    agentName: row.agent_name,
    categoryCode: row.category_code,
    categoryName: row.category_name,
    productName: row.product_name,
    batchLabel: row.batch_label,
    orderCount: row.order_count,
    qty: row.qty,
    orderValue: toRupiah(row.order_value),
    dpReceived: toRupiah(row.dp_received),
    settlementReceived: toRupiah(row.settlement_received),
  }));
};
