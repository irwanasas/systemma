import { Storefront } from "@phosphor-icons/react/ssr";
import { EmptyState } from "@/components/ui/empty-state";
import { CatalogCard } from "@/features/catalog/components/catalog-card";
import { listAgentCatalog } from "@/features/catalog/server/queries";
import { requireRole } from "@/lib/auth/require-role";

const CatalogPage = async (): Promise<React.ReactNode> => {
  await requireRole("agent");
  const products = await listAgentCatalog();
  return (
    <main>
      <div className="flex flex-col gap-1">
        <h1>Katalog</h1>
        <p className="text-muted-foreground">Seri yang sedang dibuka untuk pre-order. Harga ditentukan ukuran.</p>
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon={Storefront}
          title="Belum ada seri yang dibuka"
          description="Belum ada seri yang sedang dibuka untuk pre-order. Cek lagi nanti atau lihat Info untuk pengumuman terbaru."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.slug}>
              <CatalogCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default CatalogPage;
