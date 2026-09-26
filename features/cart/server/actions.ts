"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { firstIssue, rpcErrorMessage, type FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  cartItemIdSchema,
  cartLineQtySchema,
  checkoutSchema,
  customItemSchema,
  gridCellSchema,
  gridSchema,
} from "@/features/cart/schemas";

type RpcResult = { error: { message: string } | null };

const toFormState = ({ error }: RpcResult, successMessage?: string): FormState => {
  if (!error) return successMessage ? { message: successMessage } : {};
  const message = rpcErrorMessage(error);
  if (!message) throw error;
  return { error: message };
};

export const saveGrid = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("agent");
  const parsed = gridSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Batch tidak ditemukan." };
  const { poBatchId } = parsed.data;

  const variantIds = [...formData.keys()].filter((key) => key.startsWith("qty:")).map((key) => key.slice(4));
  const cells = [];
  for (const variantId of variantIds) {
    const cell = gridCellSchema.safeParse({
      variantId,
      qty: formData.get(`qty:${variantId}`) || 0,
      previousQty: formData.get(`previous:${variantId}`) || 0,
    });
    if (!cell.success) return { error: firstIssue(cell.error) };
    if (cell.data.qty !== cell.data.previousQty) cells.push(cell.data);
  }
  if (!cells.length) return { message: "Tidak ada perubahan." };

  const supabase = getAdminClient();
  for (const { variantId, qty } of cells) {
    const result = await supabase.rpc("cart_upsert_item", {
      p_actor_id: user.id,
      p_po_batch_id: poBatchId,
      p_qty: qty,
      p_variant_id: variantId,
    });
    if (result.error) return toFormState(result);
  }

  revalidatePath("/cart");
  return { message: "Keranjang diperbarui." };
};

export const addCustomItem = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("agent");
  const parsed = customItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { poBatchId, colorId, chestCm, lengthCm, qty } = parsed.data;

  const result = await getAdminClient().rpc("cart_upsert_item", {
    p_actor_id: user.id,
    p_po_batch_id: poBatchId,
    p_qty: qty,
    p_custom_color_id: colorId,
    p_custom_chest_cm: chestCm,
    p_custom_length_cm: lengthCm,
  });
  revalidatePath("/cart");
  return toFormState(result, "Ukuran custom ditambahkan ke keranjang.");
};

export const updateCartLineQty = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("agent");
  const parsed = cartLineQtySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { cartItemId, qty } = parsed.data;

  const supabase = getAdminClient();
  if (qty === 0) {
    const result = await supabase.rpc("cart_remove_item", { p_actor_id: user.id, p_cart_item_id: cartItemId });
    revalidatePath("/cart");
    return toFormState(result);
  }

  const { data: item, error } = await supabase
    .from("cart_items")
    .select("po_batch_id, variant_id, custom_color_id, custom_chest_cm, custom_length_cm, carts!inner(agent_id)")
    .eq("id", cartItemId)
    .eq("carts.agent_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!item) return { error: rpcErrorMessage({ message: "CART_ITEM_NOT_FOUND" }) ?? undefined };

  const result = await supabase.rpc(
    "cart_upsert_item",
    item.variant_id
      ? { p_actor_id: user.id, p_po_batch_id: item.po_batch_id, p_qty: qty, p_variant_id: item.variant_id }
      : {
          p_actor_id: user.id,
          p_po_batch_id: item.po_batch_id,
          p_qty: qty,
          p_custom_color_id: item.custom_color_id ?? undefined,
          p_custom_chest_cm: item.custom_chest_cm ?? undefined,
          p_custom_length_cm: item.custom_length_cm ?? undefined,
          p_cart_item_id: cartItemId,
        },
  );
  revalidatePath("/cart");
  return toFormState(result);
};

export const removeCartItem = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("agent");
  const parsed = cartItemIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: rpcErrorMessage({ message: "CART_ITEM_NOT_FOUND" }) ?? undefined };

  const result = await getAdminClient().rpc("cart_remove_item", {
    p_actor_id: user.id,
    p_cart_item_id: parsed.data.cartItemId,
  });
  revalidatePath("/cart");
  return toFormState(result);
};

export const clearCart = async (): Promise<FormState> => {
  const user = await requireRole("agent");
  const result = await getAdminClient().rpc("cart_clear", { p_actor_id: user.id });
  revalidatePath("/cart");
  return toFormState(result, "Keranjang dikosongkan.");
};

export const checkout = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireRole("agent");
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { data, error } = await getAdminClient().rpc("checkout_cart", {
    p_actor_id: user.id,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) return toFormState({ error });

  revalidatePath("/cart");
  revalidatePath("/orders");
  const numbers = data.map(({ order_number }) => order_number).join(",");
  redirect(`/orders?placed=${encodeURIComponent(numbers)}`);
};
