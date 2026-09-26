import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { OrderPanel } from "@/features/cart/components/order-panel";
import { loadOrderPanel } from "@/features/cart/server/order-panel";
import { ColorSwatch } from "@/features/catalog/components/color-swatch";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";

const CatalogProductPage = async ({ params }: PageProps<"/catalog/[product-slug]">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const { "product-slug": slug } = await params;
  const loaded = await loadOrderPanel(user.id, slug);
  if (!loaded) notFound();
  const { product, data } = loaded;
  const { openBatch } = product;

  return (
    <main>
      <BackLink href="/catalog" label="Kembali ke katalog" />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {product.categoryName} · PO {openBatch.label}
        </p>
        <h1>{product.name}</h1>
        <span className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
          {product.colors.map(({ id, hex }) => (
            <ColorSwatch key={id} hex={hex} className="size-5" />
          ))}
        </span>
        <p className="text-muted-foreground">
          {openBatch.closesAt && `Ditutup ${formatDateTime(openBatch.closesAt)} · `}Estimasi selesai {openBatch.etaDays} hari
          setelah DP disetujui. Harga hanya ditentukan ukuran; semua warna sama.
        </p>
        {product.description && <p>{product.description}</p>}
      </div>

      <section aria-labelledby="order-heading">
        <h2 id="order-heading">Pesan</h2>
        <OrderPanel data={data} variant="page" />
      </section>
    </main>
  );
};

export default CatalogProductPage;
