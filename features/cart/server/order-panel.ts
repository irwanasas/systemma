import "server-only";
import { getCartVariantQuantities, getGridVariants } from "@/features/cart/server/queries";
import { getCatalogProduct, type CatalogProduct } from "@/features/catalog/server/queries";
import { getSettings } from "@/features/settings/server/queries";
import type { OrderPanelData } from "@/features/cart/components/order-panel";

export type OrderPanelLoad = { product: CatalogProduct; data: OrderPanelData };

export const loadOrderPanel = async (agentId: string, slug: string): Promise<OrderPanelLoad | null> => {
  const [product, variants, cartQuantities, settings] = await Promise.all([
    getCatalogProduct(slug),
    getGridVariants(slug),
    getCartVariantQuantities(agentId),
    getSettings(),
  ]);
  if (!product) return null;
  const { openBatch } = product;
  const savedQuantities = Object.fromEntries(
    cartQuantities.filter(({ poBatchId }) => poBatchId === openBatch.id).map(({ variantId, qty }) => [variantId, qty]),
  );
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
