import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalogProduct } from "@/features/catalog/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const CatalogProductPage = async ({ params }: PageProps<"/catalog/[product-slug]">): Promise<React.ReactNode> => {
  await requireRole("agent");
  const { "product-slug": slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();
  const { openBatch } = product;

  return (
    <main>
      <p>
        <Link href="/catalog">Kembali ke katalog</Link>
      </p>
      <h1>{product.name}</h1>
      <p>
        {product.categoryName} · PO {openBatch.label}
        {openBatch.closesAt && ` · ditutup ${formatDateTime(openBatch.closesAt)}`}
      </p>
      <p>Estimasi selesai {openBatch.etaDays} hari setelah DP disetujui.</p>
      {product.description && <p>{product.description}</p>}

      <section aria-labelledby="prices-heading">
        <h2 id="prices-heading">Harga per ukuran</h2>
        <p>Semua warna memakai harga yang sama.</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Ukuran</th>
              <th scope="col">Harga per pcs</th>
            </tr>
          </thead>
          <tbody>
            {product.sizePrices.map(({ sizeCode, unitPrice }) => (
              <tr key={sizeCode}>
                <th scope="row">{sizeCode}</th>
                <td>{formatRupiah(unitPrice)}</td>
              </tr>
            ))}
            {product.customSizeEnabled && product.customUnitPrice !== null && (
              <tr>
                <th scope="row">Custom</th>
                <td>{formatRupiah(product.customUnitPrice)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="colors-heading">
        <h2 id="colors-heading">Warna</h2>
        <ul>
          {product.colors.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default CatalogProductPage;
