"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { rpcErrorMessage, type FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";

const orderIdSchema = z.object({ orderId: z.uuid() });

export const cancelOrder = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("agent");
  const parsed = orderIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: rpcErrorMessage({ message: "ORDER_NOT_FOUND" }) ?? undefined };

  const { error } = await getAdminClient().rpc("cancel_order", { p_actor_id: user.id, p_order_id: parsed.data.orderId });
  if (error) {
    const message = rpcErrorMessage(error);
    if (!message) throw error;
    return { error: message };
  }

  revalidatePath(`/orders/${parsed.data.orderId}`);
  revalidatePath("/orders");
  return { message: "Pesanan dibatalkan." };
};
