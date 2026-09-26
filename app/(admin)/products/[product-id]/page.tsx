import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { ProductFields } from "@/features/catalog/components/product-fields";
import { addColor, deleteColor, deleteProduct, saveSizePrices, updateProduct } from "@/features/catalog/server/actions";
import { getProductDetail, listCategories } from "@/features/catalog/server/queries";
import { batchStatusLabels, SIZE_CODES } from "@/features/catalog/types";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";

const ProductDetailPage = async ({ params }: PageProps<"/products/[product-id]">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const { "product-id": productId } = await params;
  const isUuid = /^[0-9a-f-]{36}$/i.test(productId);
  const [product, categories] = await Promise.all([isUuid ? getProductDetail(productId) : null, listCategories()]);
  if (!product) notFound();

  const priceBySize = new Map(product.sizePrices.map(({ sizeCode, unitPrice }) => [sizeCode, unitPrice]));

  return (
    <main>
      <h1>{product.name}</h1>
      <p>
        <Link href="/products">Kembali ke daftar produk</Link>
      </p>

      <section aria-labelledby="product-data-heading">
        <h2 id="product-data-heading">Data produk</h2>
        <ActionForm action={updateProduct} submitLabel="Simpan data produk" pendingLabel="Menyimpan…">
          <ProductFields categories={categories} product={product} />
        </ActionForm>
      </section>

      <section aria-labelledby="size-prices-heading">
        <h2 id="size-prices-heading">Harga per ukuran</h2>
        <p>Harga hanya ditentukan oleh ukuran; semua warna memakai harga yang sama. Kosongkan ukuran yang tidak dijual.</p>
        <ActionForm action={saveSizePrices} submitLabel="Simpan harga" pendingLabel="Menyimpan…">
          <input type="hidden" name="id" value={product.id} />
          {SIZE_CODES.map((sizeCode) => (
            <div key={sizeCode}>
              <label htmlFor={`price-${sizeCode}`}>Ukuran {sizeCode} (Rp)</label>
              <input
                id={`price-${sizeCode}`}
                name={sizeCode}
                inputMode="numeric"
                defaultValue={priceBySize.get(sizeCode) ?? ""}
              />
            </div>
          ))}
        </ActionForm>
      </section>

      <section aria-labelledby="colors-heading">
        <h2 id="colors-heading">Warna</h2>
        {product.colors.length === 0 ? (
          <p>Belum ada warna.</p>
        ) : (
          <ul>
            {product.colors.map(({ id, name, hex }) => (
              <li key={id}>
                {name}
                {hex && ` (${hex})`}
                <ActionForm
                  action={deleteColor}
                  submitLabel={`Hapus warna ${name}`}
                  pendingLabel="Menghapus…"
                  confirmMessage={`Hapus warna ${name}?`}
                >
                  <input type="hidden" name="id" value={id} />
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={addColor} submitLabel="Tambah warna" pendingLabel="Menambahkan…">
          <input type="hidden" name="id" value={product.id} />
          <div>
            <label htmlFor="color-name">Nama warna</label>
            <input id="color-name" name="name" required />
          </div>
          <div>
            <label htmlFor="color-hex">Kode warna (opsional)</label>
            <input id="color-hex" name="hex" placeholder="#2A2623" />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="batches-heading">
        <h2 id="batches-heading">Batch PO</h2>
        {product.batches.length === 0 ? (
          <p>Belum ada batch.</p>
        ) : (
          <ul>
            {product.batches.map(({ id, label, status, closesAt, etaDays }) => (
              <li key={id}>
                {label} — {batchStatusLabels[status]}
                {closesAt && `, tutup ${formatDateTime(closesAt)}`}, estimasi selesai {etaDays} hari setelah DP disetujui
              </li>
            ))}
          </ul>
        )}
        <p>
          <Link href="/po-batches">Kelola batch PO</Link>
        </p>
      </section>

      <section aria-labelledby="delete-heading">
        <h2 id="delete-heading">Hapus produk</h2>
        <p>Produk yang sudah pernah dipesan tidak dihapus, tetapi diarsipkan.</p>
        <ActionForm
          action={deleteProduct}
          submitLabel="Hapus produk"
          pendingLabel="Menghapus…"
          confirmMessage={`Hapus ${product.name}? Jika sudah pernah dipesan, produk akan diarsipkan.`}
        >
          <input type="hidden" name="id" value={product.id} />
        </ActionForm>
      </section>
    </main>
  );
};

export default ProductDetailPage;
