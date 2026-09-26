import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { toPoBatch } from "@/features/catalog/server/queries";
import type { PoBatch } from "@/features/catalog/types";

export type BatchListItem = PoBatch & { productName: string };

export const listBatches = async (): Promise<BatchListItem[]> => {
  const { data, error } = await getAdminClient()
    .from("po_batches")
    .select("id, product_id, batch_no, label, opens_at, closes_at, status, eta_days, products!inner(name)")
    .order("status")
    .order("batch_no", { ascending: false });
  if (error) throw error;
  return data
    .map((row) => ({ ...toPoBatch(row), productName: row.products.name }))
    .sort((first, second) => first.productName.localeCompare(second.productName) || second.batchNo - first.batchNo);
};

export type ProductOption = { id: string; name: string };

export const listProductOptions = async (): Promise<ProductOption[]> => {
  const { data, error } = await getAdminClient().from("products").select("id, name").neq("status", "archived").order("name");
  if (error) throw error;
  return data;
};
