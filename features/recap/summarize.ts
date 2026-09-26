import { toRupiah } from "@/lib/money";
import type { RecapAgentGroup, RecapRow, RecapSummary, RecapTotals } from "@/features/recap/types";

export const RECAP_CATEGORIES = [
  { code: "dress", name: "Dress" },
  { code: "koko", name: "Koko" },
  { code: "khimar_voal", name: "Khimar + Voal" },
] as const;

const sumTotals = (rows: RecapRow[]): RecapTotals => ({
  qty: rows.reduce((sum, row) => sum + row.qty, 0),
  orderValue: toRupiah(rows.reduce((sum, row) => sum + row.orderValue, 0)),
  dpReceived: toRupiah(rows.reduce((sum, row) => sum + row.dpReceived, 0)),
  settlementReceived: toRupiah(rows.reduce((sum, row) => sum + row.settlementReceived, 0)),
});

const qtyByCategory = (rows: RecapRow[]): Record<string, number> =>
  Object.fromEntries(
    RECAP_CATEGORIES.map(({ code }) => [code, rows.filter((row) => row.categoryCode === code).reduce((sum, row) => sum + row.qty, 0)]),
  );

export const summarizeRecap = (rows: RecapRow[]): RecapSummary => {
  const byAgent = new Map<string, RecapRow[]>();
  for (const row of rows) byAgent.set(row.agentId, [...(byAgent.get(row.agentId) ?? []), row]);
  const agents: RecapAgentGroup[] = [...byAgent.values()].map((agentRows) => ({
    agentId: agentRows[0].agentId,
    agentCode: agentRows[0].agentCode,
    agentName: agentRows[0].agentName,
    rows: agentRows,
    qtyByCategory: qtyByCategory(agentRows),
    totals: sumTotals(agentRows),
  }));
  return { agents, qtyByCategory: qtyByCategory(rows), totals: sumTotals(rows) };
};
