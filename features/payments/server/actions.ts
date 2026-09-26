"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { firstIssue, rpcErrorMessage, type FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";
import { checkProofFile } from "@/features/payments/proof-file";
import { reviewSchema, submitProofSchema } from "@/features/payments/schemas";
import { PROOF_BUCKET } from "@/features/payments/server/queries";

const toErrorState = (error: { message: string }): FormState => {
  const message = rpcErrorMessage(error);
  if (!message) throw error;
  return { error: message };
};

export const submitDpProof = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("agent");
  const parsed = submitProofSchema.safeParse({
    orderId: formData.get("orderId"),
    idempotencyKey: formData.get("idempotencyKey"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { orderId, idempotencyKey, amount } = parsed.data;

  const proof = formData.get("proof");
  const check = await checkProofFile(proof instanceof File ? proof : null);
  if ("error" in check) return { error: check.error };

  const supabase = getAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("agent_id", user.id)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) return toErrorState({ message: "ORDER_NOT_FOUND" });

  const proofPath = `${user.id}/${orderId}/${randomUUID()}.${check.type.extension}`;
  const { error: uploadError } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(proofPath, proof as File, { contentType: check.type.contentType, upsert: false });
  if (uploadError) return { error: "Bukti transfer gagal diunggah. Periksa koneksi lalu coba lagi." };

  const { data: paymentId, error } = await supabase.rpc("submit_dp_proof", {
    p_actor_id: user.id,
    p_order_id: orderId,
    p_proof_path: proofPath,
    p_amount: amount,
    p_idempotency_key: idempotencyKey,
  });
  if (error) {
    await supabase.storage.from(PROOF_BUCKET).remove([proofPath]);
    return toErrorState(error);
  }

  const { data: payment } = await supabase.from("payments").select("proof_path").eq("id", paymentId).single();
  if (payment?.proof_path !== proofPath) await supabase.storage.from(PROOF_BUCKET).remove([proofPath]);

  revalidatePath(`/orders/${orderId}`);
  return { message: "Bukti transfer terkirim. Admin akan memeriksanya; pesanan aman dari batas waktu sampai selesai dicek." };
};

export const reviewDp = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("admin");
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { paymentId, decision, reason } = parsed.data;

  const supabase = getAdminClient();
  const { error } = await supabase.rpc("review_dp", {
    p_actor_id: user.id,
    p_payment_id: paymentId,
    p_approve: decision === "approve",
    p_reason: reason,
  });
  if (error) return toErrorState(error);

  const { data: payment } = await supabase.from("payments").select("orders!inner(number)").eq("id", paymentId).single();
  revalidatePath("/payments");
  revalidatePath("/orders");
  const params = new URLSearchParams({ reviewed: decision, order: payment?.orders.number ?? "", at: new Date().toISOString() });
  redirect(`/payments?${params}`);
};
