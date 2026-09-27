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

const getEditableBatchSlugs = async (poBatchIds: string[]): Promise<Map<string, string>> => {
  const { data, error } = await getAdminClient()
    .from("po_batches")
    .select("id, products!inner(slug, status)")
    .in("id", poBatchIds)
    .eq("status", "open")
    .eq("products.status", "active");
  if (error) throw error;
  return new Map(data.map(({ id, products }) => [id, products.slug]));
};

const emptyCart: Cart = { groups: [], totalPcs: 0, subtotal: toRupiah(0), dpAmount: toRupiah(0), hasUnavailableItems: false };

export const getCart = async (agentId: string): Promise<Cart> => {
  const cartId = await getCartId(agentId);
  if (!cartId) return emptyCart;
  const { data: rows, error } = await getAdminClient().rpc("price_quote", { p_cart_id: cartId });
  if (error) throw error;
  if (!rows.length) return emptyCart;

  const editSlugsPromise = getEditableBatchSlugs([...new Set(rows.map((row) => row.po_batch_id))]);
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
      editSlug: null,
      lines: [],
      totalPcs: 0,
      subtotal: 0,
    };
    group.lines.push(line);
    group.totalPcs += line.qty;
    group.subtotal += line.isOrderable ? (line.lineTotal ?? 0) : 0;
    groupsByBatch.set(row.po_batch_id, group);
  }

  const [editSlugs, groups] = await Promise.all([
    editSlugsPromise,
    Promise.all(
      [...groupsByBatch.values()].map(async (group) => {
        const subtotal = toRupiah(group.subtotal);
        return { ...group, subtotal, dpAmount: subtotal > 0 ? await getDpAmount(subtotal) : toRupiah(0) };
      }),
    ),
  ]);

  return {
    groups: groups.map((group) => ({ ...group, editSlug: editSlugs.get(group.poBatchId) ?? null })),
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

export const getGridVariants = async (productSlug: string): Promise<GridVariant[]> => {
  const { data, error } = await getAdminClient()
    .from("product_variants")
    .select("id, color_id, size_code, products!inner(slug)")
    .eq("products.slug", productSlug)
    .eq("is_active", true);
  if (error) throw error;
  return data.map(({ id, color_id, size_code }) => ({ id, colorId: color_id, sizeCode: size_code }));
};

export type CartVariantQuantity = { poBatchId: string; variantId: string; qty: number };

export const getCartVariantQuantities = async (agentId: string): Promise<CartVariantQuantity[]> => {
  const { data, error } = await getAdminClient()
    .from("carts")
    .select("cart_items(po_batch_id, variant_id, qty)")
    .eq("agent_id", agentId)
    .maybeSingle();
  if (error) throw error;
  return (data?.cart_items ?? []).flatMap(({ po_batch_id, variant_id, qty }) =>
    variant_id === null ? [] : [{ poBatchId: po_batch_id, variantId: variant_id, qty }],
  );
};

export const getCartItemCount = async (agentId: string): Promise<number> => {
  const { data, error } = await getAdminClient().from("carts").select("cart_items(qty)").eq("agent_id", agentId).maybeSingle();
  if (error) throw error;
  return (data?.cart_items ?? []).reduce((sum, { qty }) => sum + qty, 0);
};
