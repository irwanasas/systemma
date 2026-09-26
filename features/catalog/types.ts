import type { Rupiah } from "@/lib/money";

export const SIZE_CODES = ["S", "M", "L", "XL", "XXL"] as const;

export type SizeCode = (typeof SIZE_CODES)[number];

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const productStatusLabels: Record<ProductStatus, string> = {
  draft: "Draf",
  active: "Aktif",
  archived: "Diarsipkan",
};

export type Category = {
  id: string;
  code: string;
  name: string;
};

export type ProductColor = {
  id: string;
  name: string;
  hex: string | null;
};

export type SizePrice = {
  sizeCode: SizeCode;
  unitPrice: Rupiah;
};

export type BatchStatus = "scheduled" | "open" | "closed";

export const batchStatusLabels: Record<BatchStatus, string> = {
  scheduled: "Terjadwal",
  open: "Dibuka",
  closed: "Ditutup",
};

export type PoBatch = {
  id: string;
  productId: string;
  batchNo: number;
  label: string;
  opensAt: string | null;
  closesAt: string | null;
  status: BatchStatus;
  etaDays: number;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  status: ProductStatus;
  customSizeEnabled: boolean;
  customUnitPrice: Rupiah | null;
  colors: ProductColor[];
  sizePrices: SizePrice[];
  batches: PoBatch[];
};
