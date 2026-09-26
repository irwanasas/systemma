"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { DB_UNIQUE_VIOLATION, firstIssue, type FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/features/audit/server/record";
import { batchStatusSchema, createBatchSchema } from "@/features/po-batches/schemas";

const revalidateBatchPages = (productId: string): void => {
  revalidatePath("/po-batches");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/catalog");
};

export const createBatch = async (_state: FormState, formData: FormData): Promise<FormState> => {
  await requireRole("admin");
  const parsed = createBatchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { productId, label, opensAt, closesAt, etaDays } = parsed.data;

  const supabase = getAdminClient();
  const { data: latest, error: latestError } = await supabase
    .from("po_batches")
    .select("batch_no")
    .eq("product_id", productId)
    .order("batch_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) throw latestError;
  const batchNo = (latest?.batch_no ?? 0) + 1;

  const { error } = await supabase.from("po_batches").insert({
    product_id: productId,
    batch_no: batchNo,
    label: label || `B${batchNo}`,
    opens_at: opensAt,
    closes_at: closesAt,
    eta_days: etaDays,
  });
  if (error?.code === DB_UNIQUE_VIOLATION) return { error: "Batch baru bentrok dengan batch lain. Silakan coba lagi." };
  if (error) throw error;

  revalidateBatchPages(productId);
  return { message: `Batch ${label || `B${batchNo}`} dibuat dengan status terjadwal.` };
};

export const setBatchStatus = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const admin = await requireRole("admin");
  const parsed = batchStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Batch tidak ditemukan." };
  const { id, status } = parsed.data;

  const { data, error } = await getAdminClient()
    .from("po_batches")
    .update({ status })
    .eq("id", id)
    .select("product_id")
    .maybeSingle();
  if (error?.code === DB_UNIQUE_VIOLATION) {
    return { error: "Produk ini sudah punya batch yang dibuka. Tutup batch itu dulu." };
  }
  if (error) throw error;
  if (!data) return { error: "Batch tidak ditemukan." };
  await recordAudit({ actorId: admin.id, action: "set_batch_status", entity: "po_batch", entityId: id, after: { status } });

  revalidateBatchPages(data.product_id);
  return {};
};
