import { ActionForm } from "@/components/ui/action-form";
import { BackLink } from "@/components/ui/back-link";
import { SectionCard } from "@/components/ui/section-card";
import { ProductFields } from "@/features/catalog/components/product-fields";
import { createProduct } from "@/features/catalog/server/actions";
import { listCategories } from "@/features/catalog/server/queries";
import { requireRole } from "@/lib/auth/require-role";

const NewProductPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const categories = await listCategories();
  return (
    <main>
      <BackLink href="/products" label="Kembali ke daftar produk" />
      <div className="flex flex-col gap-1">
        <h1>Tambah produk</h1>
        <p className="text-muted-foreground">Setelah produk dibuat, tambahkan warna dan harga per ukuran.</p>
      </div>
      <SectionCard id="new-product-heading" title="Data produk" className="max-w-3xl">
        <ActionForm action={createProduct} submitLabel="Buat produk" pendingLabel="Membuat…">
          <ProductFields categories={categories} />
        </ActionForm>
      </SectionCard>
    </main>
  );
};

export default NewProductPage;
