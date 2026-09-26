import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { addCustomItem, saveGrid } from "@/features/cart/server/actions";
import { getBatchCartQuantities, getGridVariants } from "@/features/cart/server/queries";
import { getCatalogProduct } from "@/features/catalog/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const CatalogProductPage = async ({ params }: PageProps<"/catalog/[product-slug]">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const { "product-slug": slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();
  const { openBatch } = product;
  const [variants, cartQuantities] = await Promise.all([
    getGridVariants(product.id),
    getBatchCartQuantities(user.id, openBatch.id),
  ]);
  const variantByCell = new Map(variants.map(({ id, colorId, sizeCode }) => [`${colorId}:${sizeCode}`, id]));

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

      <section aria-labelledby="order-heading">
        <h2 id="order-heading">Pesan</h2>
        <p>Isi jumlah pcs per warna dan ukuran. Isi 0 untuk menghapus dari keranjang.</p>
        <ActionForm action={saveGrid} submitLabel="Simpan ke keranjang" pendingLabel="Menyimpan…">
          <input type="hidden" name="poBatchId" value={openBatch.id} />
          <table>
            <thead>
              <tr>
                <th scope="col">Warna</th>
                {product.sizePrices.map(({ sizeCode }) => (
                  <th key={sizeCode} scope="col">
                    {sizeCode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {product.colors.map((color) => (
                <tr key={color.id}>
                  <th scope="row">{color.name}</th>
                  {product.sizePrices.map(({ sizeCode }) => {
                    const variantId = variantByCell.get(`${color.id}:${sizeCode}`);
                    if (!variantId) return <td key={sizeCode}>–</td>;
                    const currentQty = cartQuantities[variantId] ?? 0;
                    return (
                      <td key={sizeCode}>
                        <input type="hidden" name={`previous:${variantId}`} value={currentQty} />
                        <input
                          name={`qty:${variantId}`}
                          type="number"
                          min={0}
                          inputMode="numeric"
                          defaultValue={currentQty}
                          aria-label={`Jumlah ${color.name} ukuran ${sizeCode}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </ActionForm>
      </section>

      {product.customSizeEnabled && product.customUnitPrice !== null && (
        <section aria-labelledby="custom-heading">
          <h2 id="custom-heading">Custom ukuran</h2>
          <p>Lingkar dada maksimal 140 cm, panjang badan maksimal 145 cm. Harga {formatRupiah(product.customUnitPrice)} per pcs.</p>
          <ActionForm action={addCustomItem} submitLabel="Tambah ukuran custom" pendingLabel="Menambahkan…">
            <input type="hidden" name="poBatchId" value={openBatch.id} />
            <div>
              <label htmlFor="colorId">Warna</label>
              <select id="colorId" name="colorId" defaultValue="" required>
                <option value="" disabled>
                  Pilih warna
                </option>
                {product.colors.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="chestCm">Lingkar dada (cm)</label>
              <input id="chestCm" name="chestCm" type="number" min={1} max={140} step={0.1} required />
            </div>
            <div>
              <label htmlFor="lengthCm">Panjang badan (cm)</label>
              <input id="lengthCm" name="lengthCm" type="number" min={1} max={145} step={0.1} required />
            </div>
            <div>
              <label htmlFor="customQty">Jumlah (pcs)</label>
              <input id="customQty" name="qty" type="number" min={1} defaultValue={1} required />
            </div>
          </ActionForm>
        </section>
      )}

      <p>
        <Link href="/cart">Lihat keranjang</Link>
      </p>
    </main>
  );
};

export default CatalogProductPage;
