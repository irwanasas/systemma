import type { Database } from "@/lib/supabase/database.types";
import type { Rupiah } from "@/lib/money";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

export const orderStatusLabels: Record<OrderStatus, string> = {
  AWAITING_DP: "Menunggu DP",
  DP_UNDER_REVIEW: "Bukti DP sedang dicek",
  DP_RECEIVED: "DP diterima",
  IN_PRODUCTION: "Diproduksi",
  AWAITING_SETTLEMENT: "Menunggu pelunasan",
  SETTLED: "Lunas",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
};

export type OrderSummary = {
  id: string;
  number: string;
  status: OrderStatus;
  productName: string;
  batchLabel: string;
  subtotal: Rupiah;
  dpAmount: Rupiah;
  settlementAmount: Rupiah;
  dpDueAt: string;
  etaAt: string | null;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  productName: string;
  colorName: string;
  sizeCode: string | null;
  customChestCm: number | null;
  customLengthCm: number | null;
  qty: number;
  unitPrice: Rupiah;
  lineTotal: Rupiah;
};

export type OrderDetail = OrderSummary & {
  agentId: string;
  items: OrderItem[];
};
