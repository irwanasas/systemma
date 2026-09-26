import type { Rupiah } from "@/lib/money";

export type CartLine = {
  id: string;
  variantId: string | null;
  colorName: string;
  sizeCode: string | null;
  customChestCm: number | null;
  customLengthCm: number | null;
  qty: number;
  unitPrice: Rupiah | null;
  lineTotal: Rupiah | null;
  isOrderable: boolean;
};

export type CartBatchGroup = {
  poBatchId: string;
  batchLabel: string;
  productName: string;
  lines: CartLine[];
  totalPcs: number;
  subtotal: Rupiah;
  dpAmount: Rupiah;
};

export type Cart = {
  groups: CartBatchGroup[];
  totalPcs: number;
  subtotal: Rupiah;
  dpAmount: Rupiah;
  hasUnavailableItems: boolean;
};
