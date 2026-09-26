import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, X } from "@phosphor-icons/react/ssr";
import { ActionForm } from "@/components/ui/action-form";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/date-time";
import { PageTabs } from "@/components/ui/page-tabs";
import { SectionCard } from "@/components/ui/section-card";
import { TableCard } from "@/components/ui/table-card";
import { ColorSwatch } from "@/features/catalog/components/color-swatch";
import { ProductFields } from "@/features/catalog/components/product-fields";
import { ProductStatusBadge } from "@/features/catalog/components/product-status-badge";
import { BatchStatusBadge } from "@/features/catalog/components/batch-status-badge";
import { addColor, deleteColor, deleteProduct, saveSizePrices, updateProduct } from "@/features/catalog/server/actions";
import { getProductDetail, listCategories } from "@/features/catalog/server/queries";
import { SIZE_CODES } from "@/features/catalog/types";
import { requireRole } from "@/lib/auth/require-role";

const ProductDetailPage = async ({ params }: PageProps<"/products/[product-id]">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const { "product-id": productId } = await params;
  const isUuid = /^[0-9a-f-]{36}$/i.test(productId);
  const [product, categories] = await Promise.all([isUuid ? getProductDetail(productId) : null, listCategories()]);
  if (!product) notFound();

  const priceBySize = new Map(product.sizePrices.map(({ sizeCode, unitPrice }) => [sizeCode, unitPrice]));

  const dataTab = (
    <>
      <SectionCard id="product-data-heading" title="Data produk">
        <ActionForm action={updateProduct} submitLabel="Simpan data produk" pendingLabel="Menyimpan…">
          <ProductFields categories={categories} product={product} />
        </ActionForm>
      </SectionCard>
      <SectionCard id="delete-heading" title="Zona berbahaya" className="border-danger/30">
        <p className="text-ui text-muted-foreground">Produk yang sudah pernah dipesan tidak dihapus, tetapi diarsipkan.</p>
        <ActionForm
          action={deleteProduct}
          submitLabel="Hapus produk"
          tone="ghost"
          buttonClassName="border border-danger/40 text-danger hover:bg-danger-soft hover:text-danger"
          pendingLabel="Menghapus…"
          confirmTitle="Hapus produk?"
          confirmMessage={`Hapus ${product.name}? Jika sudah pernah dipesan, produk akan diarsipkan.`}
        >
          <input type="hidden" name="id" value={product.id} />
        </ActionForm>
      </SectionCard>
    </>
  );

  const pricesTab = (
    <SectionCard id="size-prices-heading" title="Harga per ukuran">
      <p className="text-ui text-muted-foreground">
        Harga hanya ditentukan oleh ukuran; semua warna memakai harga yang sama. Kosongkan ukuran yang tidak dijual.
      </p>
      <ActionForm action={saveSizePrices} submitLabel="Simpan harga" pendingLabel="Menyimpan…">
        <input type="hidden" name="id" value={product.id} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SIZE_CODES.map((sizeCode) => (
            <div key={sizeCode}>
              <label htmlFor={`price-${sizeCode}`}>Ukuran {sizeCode} (Rp)</label>
              <input
                id={`price-${sizeCode}`}
                name={sizeCode}
                inputMode="numeric"
                defaultValue={priceBySize.get(sizeCode) ?? ""}
                className="tabular-nums"
              />
            </div>
          ))}
        </div>
      </ActionForm>
    </SectionCard>
  );

  const colorsTab = (
    <SectionCard id="colors-heading" title="Warna">
      {product.colors.length === 0 ? (
        <p className="text-ui text-muted-foreground">Belum ada warna. Tambahkan minimal satu warna agar seri bisa dipesan.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {product.colors.map(({ id, name, hex }) => (
            <li key={id} className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-1 pl-3 text-ui">
              <ColorSwatch hex={hex} />
              <span>{name}</span>
              {hex && <span className="text-sm text-muted-foreground uppercase">{hex}</span>}
              <ActionForm
                action={deleteColor}
                submitLabel={`Hapus warna ${name}`}
                tone="ghost"
                hideLabel
                icon={<X aria-hidden="true" />}
                buttonClassName="!min-h-0 size-8 rounded-full text-muted-foreground hover:text-danger"
                pendingLabel="Menghapus…"
                confirmTitle="Hapus warna?"
                confirmMessage={`Hapus warna ${name} dari ${product.name}?`}
                confirmLabel="Hapus"
              >
                <input type="hidden" name="id" value={id} />
              </ActionForm>
            </li>
          ))}
        </ul>
      )}
      <ActionForm
        action={addColor}
        submitLabel="Tambah warna"
        pendingLabel="Menambahkan…"
        tone="secondary"
        className="border-t border-border pt-4"
      >
        <input type="hidden" name="id" value={product.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="color-name">Nama warna</label>
            <input id="color-name" name="name" required />
          </div>
          <div>
            <label htmlFor="color-hex">Kode warna (opsional)</label>
            <input id="color-hex" name="hex" placeholder="#2A2623" />
          </div>
        </div>
      </ActionForm>
    </SectionCard>
  );

  const batchesTab = (
    <SectionCard
      id="batches-heading"
      title="Batch PO"
      action={
        <Button asChild variant="outline" size="sm" className="min-h-9 text-ui">
          <Link href="/po-batches" className="text-foreground no-underline hover:no-underline">
            Kelola batch PO
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      {product.batches.length === 0 ? (
        <p className="text-ui text-muted-foreground">Belum ada batch.</p>
      ) : (
        <TableCard>
          <table>
            <thead>
              <tr>
                <th scope="col">Batch</th>
                <th scope="col">Status</th>
                <th scope="col">Tutup</th>
                <th scope="col" className="text-right">
                  Estimasi
                </th>
              </tr>
            </thead>
            <tbody>
              {product.batches.map(({ id, label, status, closesAt, etaDays }) => (
                <tr key={id}>
                  <td className="font-medium">{label}</td>
                  <td>
                    <BatchStatusBadge status={status} />
                  </td>
                  <td>{closesAt ? <DateTime value={closesAt} /> : <span className="text-muted-foreground">–</span>}</td>
                  <td className="text-right" title="Hari setelah DP disetujui">
                    {etaDays} hari
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </SectionCard>
  );

  return (
    <main>
      <BackLink href="/products" label="Kembali ke daftar produk" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1>{product.name}</h1>
          <ProductStatusBadge status={product.status} />
        </div>
        <p className="flex flex-wrap items-center gap-2 text-ui text-muted-foreground">
          {product.categoryName} · /{product.slug}
          <span className="flex items-center gap-1" aria-hidden="true">
            {product.colors.map(({ id, hex }) => (
              <ColorSwatch key={id} hex={hex} />
            ))}
          </span>
        </p>
      </div>
      <PageTabs
        label="Bagian produk"
        tabs={[
          { value: "data", label: "Data produk", content: dataTab },
          { value: "prices", label: "Harga", content: pricesTab },
          { value: "colors", label: "Warna", content: colorsTab },
          { value: "batches", label: "Batch PO", content: batchesTab },
        ]}
      />
    </main>
  );
};

export default ProductDetailPage;
