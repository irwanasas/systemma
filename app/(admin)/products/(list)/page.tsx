import Link from "next/link";
import { Plus, TShirt } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { ListPager, ListSearch } from "@/components/ui/list-controls";
import { TableCard } from "@/components/ui/table-card";
import { ProductStatusBadge } from "@/features/catalog/components/product-status-badge";
import { ProductThumb } from "@/features/catalog/components/product-thumb";
import { listAdminProducts, listCategories } from "@/features/catalog/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { buildHref, matchesQuery, paginate, readPageSize, readParam } from "@/lib/list-params";

const ProductsPage = async ({ searchParams }: PageProps<"/products">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const params = await searchParams;
  const query = readParam(params.q);
  const categoryParam = readParam(params.category);
  const [products, categories] = await Promise.all([listAdminProducts(), listCategories()]);
  const category = categories.find(({ code }) => code === categoryParam) ?? null;
  const visible = products.filter(
    (product) => (!category || product.categoryId === category.id) && matchesQuery(query, product.name, product.slug),
  );
  const pageSize = readPageSize(readParam(params.size), 20);
  const size = pageSize === 20 ? undefined : String(pageSize);
  const shown = paginate(visible, readParam(params.page), pageSize);
  const chips = [
    { label: "Semua", href: buildHref("/products", { q: query, size }), active: category === null },
    ...categories.map(({ code, name }) => ({
      label: name,
      href: buildHref("/products", { category: code, q: query, size }),
      active: category?.code === code,
    })),
  ];

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Produk</h1>
        <Button asChild className="min-h-[var(--control-height)] text-ui">
          <Link href="/products/new" className="text-primary-foreground no-underline hover:no-underline">
            <Plus aria-hidden="true" />
            Tambah produk
          </Link>
        </Button>
      </div>
      {products.length === 0 ? (
        <EmptyState icon={TShirt} title="Belum ada produk" description="Tambah seri pertama, lalu atur warna dan harga per ukuran." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <ListSearch label="Cari produk" placeholder="Nama seri atau slug" />
            <FilterChips label="Filter kategori" chips={chips} />
          </div>
          {visible.length === 0 ? (
            <EmptyState icon={TShirt} title="Tidak ada produk" description="Tidak ada produk yang cocok dengan filter ini." />
          ) : (
            <TableCard>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Seri</th>
                    <th scope="col" className="hidden sm:table-cell">
                      Kategori
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col" className="hidden sm:table-cell">
                      Batch dibuka
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.items.map(({ id, name, slug, categoryName, status, openBatchLabel, colors }) => (
                    <tr key={id} className="relative">
                      <td>
                        <span className="flex items-center gap-3 py-1">
                          <ProductThumb name={name} colors={colors} />
                          <span className="flex min-w-0 flex-col">
                            <Link href={`/products/${id}`} className="font-medium text-foreground after:absolute after:inset-0">
                              {name}
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              <span className="sm:hidden">{categoryName} · </span>
                              {colors.length} warna · /{slug}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="hidden sm:table-cell">{categoryName}</td>
                      <td>
                        <ProductStatusBadge status={status} />
                      </td>
                      <td className="hidden sm:table-cell">{openBatchLabel ?? <span className="text-muted-foreground">–</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableCard>
          )}
          {visible.length > 0 && <ListPager total={shown.total} page={shown.page} pageSize={pageSize} />}
        </>
      )}
    </main>
  );
};

export default ProductsPage;
