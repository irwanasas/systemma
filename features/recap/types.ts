import type { Rupiah } from "@/lib/money";

export type RecapRow = {
  agentId: string;
  agentCode: string;
  agentName: string;
  categoryCode: string;
  categoryName: string;
  productName: string;
  batchLabel: string;
  orderCount: number;
  qty: number;
  orderValue: Rupiah;
  dpReceived: Rupiah;
  settlementReceived: Rupiah;
};

export type RecapTotals = {
  qty: number;
  orderValue: Rupiah;
  dpReceived: Rupiah;
  settlementReceived: Rupiah;
};

export type RecapAgentGroup = {
  agentId: string;
  agentCode: string;
  agentName: string;
  rows: RecapRow[];
  qtyByCategory: Record<string, number>;
  totals: RecapTotals;
};

export type RecapSummary = {
  agents: RecapAgentGroup[];
  qtyByCategory: Record<string, number>;
  totals: RecapTotals;
};
