import { notFound } from "next/navigation";
import { OrderPanel } from "@/features/cart/components/order-panel";
import { loadOrderPanel } from "@/features/cart/server/order-panel";
import { requireRole } from "@/lib/auth/require-role";

const CatalogProductModal = async ({ params }: PageProps<"/catalog/[product-slug]">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const { "product-slug": slug } = await params;
  const loaded = await loadOrderPanel(user.id, slug);
  if (!loaded) notFound();
  const { product, data } = loaded;
  return (
    <OrderPanel
      data={data}
      variant="modal"
      header={{
        slug: product.slug,
        name: product.name,
        categoryName: product.categoryName,
        batchLabel: product.openBatch.label,
        closesAt: product.openBatch.closesAt,
      }}
    />
  );
};

export default CatalogProductModal;
