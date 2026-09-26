import Link from "next/link";
import { listAdminProducts } from "@/features/catalog/server/queries";
import { productStatusLabels } from "@/features/catalog/types";
import { requireRole } from "@/lib/auth/require-role";

const ProductsPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const products = await listAdminProducts();
  return (
    <main>
      <h1>Produk</h1>
      <p>
        <Link href="/products/new">Tambah produk</Link>
      </p>
      {products.length === 0 ? (
        <p>Belum ada produk.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Seri</th>
              <th scope="col">Kategori</th>
              <th scope="col">Status</th>
              <th scope="col">Batch dibuka</th>
            </tr>
          </thead>
          <tbody>
            {products.map(({ id, name, categoryName, status, openBatchLabel }) => (
              <tr key={id}>
                <td>
                  <Link href={`/products/${id}`}>{name}</Link>
                </td>
                <td>{categoryName}</td>
                <td>{productStatusLabels[status]}</td>
                <td>{openBatchLabel ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default ProductsPage;
