"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { DB_FOREIGN_KEY_VIOLATION, DB_UNIQUE_VIOLATION, firstIssue, type FormState } from "@/lib/errors";
import { getAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/features/audit/server/record";
import { colorSchema, idSchema, productSchema, sizePricesSchema } from "@/features/catalog/schemas";
import { SIZE_CODES } from "@/features/catalog/types";

const productPath = (productId: string): string => `/products/${productId}`;

const toProductRow = (formData: FormData) => {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) } as const;
  const { name, slug, categoryId, description, status, customSizeEnabled, customUnitPrice } = parsed.data;
  return {
    row: {
      name,
      slug,
      category_id: categoryId,
      description,
      status,
      custom_size_enabled: customSizeEnabled,
      custom_unit_price: customUnitPrice,
    },
  } as const;
};

const DUPLICATE_SLUG_MESSAGE = "Slug ini sudah dipakai produk lain. Gunakan slug yang berbeda.";

export const createProduct = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const admin = await requireRole("admin");
  const result = toProductRow(formData);
  if ("error" in result) return { error: result.error };

  const { data, error } = await getAdminClient().from("products").insert(result.row).select("id").single();
  if (error?.code === DB_UNIQUE_VIOLATION) return { error: DUPLICATE_SLUG_MESSAGE };
  if (error) throw error;
  await recordAudit({ actorId: admin.id, action: "create_product", entity: "product", entityId: data.id, after: result.row });

  revalidatePath("/products");
  redirect(productPath(data.id));
};

export const updateProduct = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const admin = await requireRole("admin");
  const parsedId = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsedId.success) return { error: "Produk tidak ditemukan." };
  const result = toProductRow(formData);
  if ("error" in result) return { error: result.error };

  const { error } = await getAdminClient().from("products").update(result.row).eq("id", parsedId.data.id);
  if (error?.code === DB_UNIQUE_VIOLATION) return { error: DUPLICATE_SLUG_MESSAGE };
  if (error) throw error;
  await recordAudit({ actorId: admin.id, action: "update_product", entity: "product", entityId: parsedId.data.id, after: result.row });

  revalidatePath(productPath(parsedId.data.id));
  return { message: "Data produk disimpan." };
};

export const saveSizePrices = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const admin = await requireRole("admin");
  const parsedId = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsedId.success) return { error: "Produk tidak ditemukan." };
  const parsed = sizePricesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { id: productId } = parsedId.data;

  const supabase = getAdminClient();
  const pricedSizes = SIZE_CODES.flatMap((sizeCode) => {
    const unitPrice = parsed.data[sizeCode];
    return unitPrice === null ? [] : [{ product_id: productId, size_code: sizeCode, unit_price: unitPrice }];
  });
  const unpricedSizes = SIZE_CODES.filter((sizeCode) => parsed.data[sizeCode] === null);

  if (pricedSizes.length) {
    const { error } = await supabase.from("size_prices").upsert(pricedSizes);
    if (error) throw error;
  }
  if (unpricedSizes.length) {
    const { error } = await supabase
      .from("size_prices")
      .delete()
      .eq("product_id", productId)
      .in("size_code", unpricedSizes);
    if (error) throw error;
  }

  await recordAudit({ actorId: admin.id, action: "update_size_prices", entity: "product", entityId: productId, after: parsed.data });
  revalidatePath(productPath(productId));
  return { message: "Harga per ukuran disimpan." };
};

export const addColor = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const admin = await requireRole("admin");
  const parsedId = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsedId.success) return { error: "Produk tidak ditemukan." };
  const parsed = colorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { id: productId } = parsedId.data;

  const supabase = getAdminClient();
  const { count, error: countError } = await supabase
    .from("product_colors")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);
  if (countError) throw countError;

  const { error } = await supabase
    .from("product_colors")
    .insert({ product_id: productId, name: parsed.data.name, hex: parsed.data.hex, sort: (count ?? 0) + 1 });
  if (error?.code === DB_UNIQUE_VIOLATION) return { error: "Warna dengan nama itu sudah ada di produk ini." };
  if (error) throw error;
  await recordAudit({ actorId: admin.id, action: "add_color", entity: "product", entityId: productId, after: parsed.data });

  revalidatePath(productPath(productId));
  return { message: `Warna ${parsed.data.name} ditambahkan.` };
};

export const deleteColor = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const admin = await requireRole("admin");
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Warna tidak ditemukan." };

  const { data, error } = await getAdminClient()
    .from("product_colors")
    .delete()
    .eq("id", parsed.data.id)
    .select("product_id, name")
    .maybeSingle();
  if (error?.code === DB_FOREIGN_KEY_VIOLATION) {
    return { error: "Warna ini sudah dipakai di keranjang atau pesanan, jadi tidak bisa dihapus." };
  }
  if (error) throw error;
  if (data) {
    await recordAudit({ actorId: admin.id, action: "delete_color", entity: "product", entityId: data.product_id, before: { name: data.name } });
    revalidatePath(productPath(data.product_id));
  }
  return {};
};

export const deleteProduct = async (_state: FormState, formData: FormData): Promise<FormState> => {
  const admin = await requireRole("admin");
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Produk tidak ditemukan." };
  const { id: productId } = parsed.data;

  const supabase = getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error?.code === DB_FOREIGN_KEY_VIOLATION) {
    const { error: archiveError } = await supabase.from("products").update({ status: "archived" }).eq("id", productId);
    if (archiveError) throw archiveError;
    await recordAudit({ actorId: admin.id, action: "archive_product", entity: "product", entityId: productId });
    revalidatePath(productPath(productId));
    return { message: "Produk ini sudah pernah dipesan, jadi diarsipkan (tidak dihapus). Agen tidak bisa memesannya lagi." };
  }
  if (error) throw error;
  await recordAudit({ actorId: admin.id, action: "delete_product", entity: "product", entityId: productId });

  revalidatePath("/products");
  redirect("/products");
};
