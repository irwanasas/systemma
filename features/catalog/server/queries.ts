import "server-only";
import { toRupiah, type Rupiah } from "@/lib/money";
import { getAdminClient } from "@/lib/supabase/admin";
import type {
  BatchStatus,
  Category,
  PoBatch,
  ProductDetail,
  ProductStatus,
  SizeCode,
  SizePrice,
} from "@/features/catalog/types";

type BatchRow = {
  id: string;
  product_id: string;
  batch_no: number;
  label: string;
  opens_at: string | null;
  closes_at: string | null;
  status: string;
  eta_days: number;
};

export const toPoBatch = (row: BatchRow): PoBatch => ({
  id: row.id,
  productId: row.product_id,
  batchNo: row.batch_no,
  label: row.label,
  opensAt: row.opens_at,
  closesAt: row.closes_at,
  status: row.status as BatchStatus,
  etaDays: row.eta_days,
});

const sizeSort = (sizeCode: string): number => ["S", "M", "L", "XL", "XXL"].indexOf(sizeCode);

const PRODUCT_DETAIL_SELECT =
  "id, slug, name, category_id, description, status, custom_size_enabled, custom_unit_price, categories!inner(name), product_colors(id, name, hex, sort), size_prices(size_code, unit_price), po_batches(id, product_id, batch_no, label, opens_at, closes_at, status, eta_days)";

type ProductDetailRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  description: string | null;
  status: string;
  custom_size_enabled: boolean;
  custom_unit_price: number | null;
  categories: { name: string };
  product_colors: { id: string; name: string; hex: string | null; sort: number }[];
  size_prices: { size_code: string; unit_price: number }[];
  po_batches: BatchRow[];
};

const toProductDetail = (row: ProductDetailRow): ProductDetail => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  categoryId: row.category_id,
  categoryName: row.categories.name,
  description: row.description,
  status: row.status as ProductStatus,
  customSizeEnabled: row.custom_size_enabled,
  customUnitPrice: row.custom_unit_price === null ? null : toRupiah(row.custom_unit_price),
  colors: [...row.product_colors]
    .sort((first, second) => first.sort - second.sort || first.name.localeCompare(second.name))
    .map(({ id, name, hex }) => ({ id, name, hex })),
  sizePrices: [...row.size_prices]
    .sort((first, second) => sizeSort(first.size_code) - sizeSort(second.size_code))
    .map(({ size_code, unit_price }): SizePrice => ({ sizeCode: size_code as SizeCode, unitPrice: toRupiah(unit_price) })),
  batches: [...row.po_batches].sort((first, second) => second.batch_no - first.batch_no).map(toPoBatch),
});

export const listCategories = async (): Promise<Category[]> => {
  const { data, error } = await getAdminClient().from("categories").select("id, code, name").order("name");
  if (error) throw error;
  return data;
};

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  status: ProductStatus;
  openBatchLabel: string | null;
  colors: { name: string; hex: string | null }[];
};

export const listAdminProducts = async (): Promise<AdminProductListItem[]> => {
  const { data, error } = await getAdminClient()
    .from("products")
    .select("id, name, slug, category_id, status, categories!inner(name), po_batches(label, status), product_colors(name, hex, sort)")
    .order("name");
  if (error) throw error;
  return data.map(({ id, name, slug, category_id, status, categories, po_batches, product_colors }) => ({
    id,
    name,
    slug,
    categoryId: category_id,
    categoryName: categories.name,
    status: status as ProductStatus,
    openBatchLabel: po_batches.find((batch) => batch.status === "open")?.label ?? null,
    colors: [...product_colors]
      .sort((first, second) => first.sort - second.sort || first.name.localeCompare(second.name))
      .map(({ name: colorName, hex }) => ({ name: colorName, hex })),
  }));
};

export const getProductDetail = async (productId: string): Promise<ProductDetail | null> => {
  const { data, error } = await getAdminClient()
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("id", productId)
    .maybeSingle<ProductDetailRow>();
  if (error) throw error;
  return data ? toProductDetail(data) : null;
};

export type CatalogListItem = {
  slug: string;
  name: string;
  categoryName: string;
  batchLabel: string;
  closesAt: string | null;
  minPrice: Rupiah | null;
  maxPrice: Rupiah | null;
  colors: { name: string; hex: string | null }[];
};

export const listAgentCatalog = async (): Promise<CatalogListItem[]> => {
  const { data, error } = await getAdminClient()
    .from("products")
    .select(
      "slug, name, categories!inner(name), size_prices(unit_price), product_colors(name, hex, sort), po_batches!inner(label, closes_at, status)",
    )
    .eq("status", "active")
    .eq("po_batches.status", "open")
    .order("name");
  if (error) throw error;
  return data.map(({ slug, name, categories, size_prices, product_colors, po_batches }) => {
    const prices = size_prices.map(({ unit_price }) => unit_price);
    const [openBatch] = po_batches;
    return {
      slug,
      name,
      categoryName: categories.name,
      batchLabel: openBatch.label,
      closesAt: openBatch.closes_at,
      minPrice: prices.length ? toRupiah(Math.min(...prices)) : null,
      maxPrice: prices.length ? toRupiah(Math.max(...prices)) : null,
      colors: [...product_colors]
        .sort((first, second) => first.sort - second.sort || first.name.localeCompare(second.name))
        .map(({ name: colorName, hex }) => ({ name: colorName, hex })),
    };
  });
};

export type CatalogProduct = ProductDetail & { openBatch: PoBatch };

export const getCatalogProduct = async (slug: string): Promise<CatalogProduct | null> => {
  const { data, error } = await getAdminClient()
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle<ProductDetailRow>();
  if (error) throw error;
  if (!data) return null;
  const product = toProductDetail(data);
  const openBatch = product.batches.find((batch) => batch.status === "open");
  return openBatch ? { ...product, openBatch } : null;
};
