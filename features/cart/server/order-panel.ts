import "server-only";
import { getBatchCartQuantities, getGridVariants } from "@/features/cart/server/queries";
import { getCatalogProduct, type CatalogProduct } from "@/features/catalog/server/queries";
import { getSettings } from "@/features/settings/server/queries";
import type { OrderPanelData } from "@/features/cart/components/order-panel";

export type OrderPanelLoad = { product: CatalogProduct; data: OrderPanelData };

export const loadOrderPanel = async (agentId: string, slug: string): Promise<OrderPanelLoad | null> => {
  const product = await getCatalogProduct(slug);
  if (!product) return null;
  const { openBatch } = product;
  const [variants, savedQuantities, settings] = await Promise.all([
    getGridVariants(product.id),
    getBatchCartQuantities(agentId, openBatch.id),
    getSettings(),
  ]);
  return {
    product,
    data: {
      poBatchId: openBatch.id,
      colors: product.colors,
      sizes: product.sizePrices,
      variantByCell: Object.fromEntries(variants.map(({ id, colorId, sizeCode }) => [`${colorId}:${sizeCode}`, id])),
      savedQuantities,
      dpPercent: settings.dp_percent,
      custom:
        product.customSizeEnabled && product.customUnitPrice !== null
          ? {
              unitPrice: product.customUnitPrice,
              chestMaxCm: settings.custom_size_limits.chest_max_cm,
              lengthMaxCm: settings.custom_size_limits.length_max_cm,
            }
          : null,
    },
  };
};
