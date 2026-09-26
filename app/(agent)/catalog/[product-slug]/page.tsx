import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { CustomSizeForm } from "@/features/cart/components/custom-size-form";
import { OrderGrid } from "@/features/cart/components/order-grid";
import { getBatchCartQuantities, getGridVariants } from "@/features/cart/server/queries";
import { getCatalogProduct } from "@/features/catalog/server/queries";
import { getSettings } from "@/features/settings/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const CatalogProductPage = async ({ params }: PageProps<"/catalog/[product-slug]">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const { "product-slug": slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();
  const { openBatch } = product;
  const [variants, cartQuantities, settings] = await Promise.all([
    getGridVariants(product.id),
    getBatchCartQuantities(user.id, openBatch.id),
    getSettings(),
  ]);
  const variantByCell = Object.fromEntries(variants.map(({ id, colorId, sizeCode }) => [`${colorId}:${sizeCode}`, id]));

  return (
    <main>
      <p>
        <Link href="/catalog" className="inline-flex items-center gap-1">
          <ArrowLeft aria-hidden="true" />
          Kembali ke katalog
        </Link>
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {product.categoryName} · PO {openBatch.label}
        </p>
        <h1>{product.name}</h1>
        <p className="text-muted-foreground">
          {openBatch.closesAt && `Ditutup ${formatDateTime(openBatch.closesAt)} · `}Estimasi selesai {openBatch.etaDays} hari
          setelah DP disetujui. Harga hanya ditentukan ukuran; semua warna sama.
        </p>
        {product.description && <p>{product.description}</p>}
      </div>

      <section aria-labelledby="order-heading">
        <h2 id="order-heading">Pesan</h2>
        <OrderGrid
          poBatchId={openBatch.id}
          colors={product.colors.map(({ id, name }) => ({ id, name }))}
          sizes={product.sizePrices}
          variantByCell={variantByCell}
          savedQuantities={cartQuantities}
          dpPercent={settings.dp_percent}
        />
      </section>

      {product.customSizeEnabled && product.customUnitPrice !== null && (
        <section aria-labelledby="custom-heading">
          <details className="rounded-lg border border-border bg-surface p-4">
            <summary className="min-h-11 content-center">
              <h2 id="custom-heading" className="inline">
                Custom ukuran
              </h2>{" "}
              <span className="text-muted-foreground">· {formatRupiah(product.customUnitPrice)} per pcs</span>
            </summary>
            <div className="pt-4">
              <CustomSizeForm
                poBatchId={openBatch.id}
                colors={product.colors.map(({ id, name }) => ({ id, name }))}
                chestMaxCm={settings.custom_size_limits.chest_max_cm}
                lengthMaxCm={settings.custom_size_limits.length_max_cm}
              />
            </div>
          </details>
        </section>
      )}

      <p>
        <Link href="/cart">Lihat keranjang</Link>
      </p>
    </main>
  );
};

export default CatalogProductPage;
