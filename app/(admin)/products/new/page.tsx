import { ActionForm } from "@/components/ui/action-form";
import { ProductFields } from "@/features/catalog/components/product-fields";
import { createProduct } from "@/features/catalog/server/actions";
import { listCategories } from "@/features/catalog/server/queries";
import { requireRole } from "@/lib/auth/require-role";

const NewProductPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const categories = await listCategories();
  return (
    <main>
      <h1>Tambah produk</h1>
      <p>Setelah produk dibuat, tambahkan warna dan harga per ukuran.</p>
      <ActionForm action={createProduct} submitLabel="Buat produk" pendingLabel="Membuat…">
        <ProductFields categories={categories} />
      </ActionForm>
    </main>
  );
};

export default NewProductPage;
