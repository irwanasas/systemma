import "server-only";
import { toRupiah, type Rupiah } from "@/lib/money";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Cart, CartBatchGroup, CartLine } from "@/features/cart/types";

const getCartId = async (agentId: string): Promise<string | null> => {
  const { data, error } = await getAdminClient().from("carts").select("id").eq("agent_id", agentId).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
};

export const getDpAmount = async (subtotal: Rupiah): Promise<Rupiah> => {
  const { data, error } = await getAdminClient().rpc("dp_amount_for", { p_subtotal: subtotal });
  if (error) throw error;
  return toRupiah(data);
};

const emptyCart: Cart = { groups: [], totalPcs: 0, subtotal: toRupiah(0), dpAmount: toRupiah(0), hasUnavailableItems: false };

export const getCart = async (agentId: string): Promise<Cart> => {
  const cartId = await getCartId(agentId);
  if (!cartId) return emptyCart;
  const { data: rows, error } = await getAdminClient().rpc("price_quote", { p_cart_id: cartId });
  if (error) throw error;
  if (!rows.length) return emptyCart;

  const groupsByBatch = new Map<string, Omit<CartBatchGroup, "dpAmount" | "subtotal"> & { subtotal: number }>();
  for (const row of rows) {
    const line: CartLine = {
      id: row.cart_item_id,
      variantId: row.variant_id,
      colorName: row.color_name,
      sizeCode: row.size_code,
      customChestCm: row.custom_chest_cm,
      customLengthCm: row.custom_length_cm,
      qty: row.qty,
      unitPrice: row.unit_price === null ? null : toRupiah(row.unit_price),
      lineTotal: row.line_total === null ? null : toRupiah(row.line_total),
      isOrderable: row.is_orderable,
    };
    const group = groupsByBatch.get(row.po_batch_id) ?? {
      poBatchId: row.po_batch_id,
      batchLabel: row.batch_label,
      productName: row.product_name,
      lines: [],
      totalPcs: 0,
      subtotal: 0,
    };
    group.lines.push(line);
    group.totalPcs += line.qty;
    group.subtotal += line.isOrderable ? (line.lineTotal ?? 0) : 0;
    groupsByBatch.set(row.po_batch_id, group);
  }

  const groups = await Promise.all(
    [...groupsByBatch.values()].map(async (group) => {
      const subtotal = toRupiah(group.subtotal);
      return { ...group, subtotal, dpAmount: subtotal > 0 ? await getDpAmount(subtotal) : toRupiah(0) };
    }),
  );

  return {
    groups,
    totalPcs: groups.reduce((sum, group) => sum + group.totalPcs, 0),
    subtotal: toRupiah(groups.reduce((sum, group) => sum + group.subtotal, 0)),
    dpAmount: toRupiah(groups.reduce((sum, group) => sum + group.dpAmount, 0)),
    hasUnavailableItems: rows.some((row) => !row.is_orderable),
  };
};

export type GridVariant = {
  id: string;
  colorId: string;
  sizeCode: string;
};

export const getGridVariants = async (productId: string): Promise<GridVariant[]> => {
  const { data, error } = await getAdminClient()
    .from("product_variants")
    .select("id, color_id, size_code")
    .eq("product_id", productId)
    .eq("is_active", true);
  if (error) throw error;
  return data.map(({ id, color_id, size_code }) => ({ id, colorId: color_id, sizeCode: size_code }));
};

export const getBatchCartQuantities = async (agentId: string, poBatchId: string): Promise<Record<string, number>> => {
  const cartId = await getCartId(agentId);
  if (!cartId) return {};
  const { data, error } = await getAdminClient()
    .from("cart_items")
    .select("variant_id, qty")
    .eq("cart_id", cartId)
    .eq("po_batch_id", poBatchId)
    .not("variant_id", "is", null);
  if (error) throw error;
  return Object.fromEntries(data.map(({ variant_id, qty }) => [variant_id, qty]));
};
