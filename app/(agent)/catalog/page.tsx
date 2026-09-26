import Link from "next/link";
import { listAgentCatalog } from "@/features/catalog/server/queries";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const CatalogPage = async (): Promise<React.ReactNode> => {
  await requireRole("agent");
  const products = await listAgentCatalog();
  return (
    <main>
      <h1>Katalog</h1>
      {products.length === 0 ? (
        <p>Belum ada seri yang sedang dibuka untuk pre-order.</p>
      ) : (
        <ul>
          {products.map(({ slug, name, categoryName, batchLabel, closesAt, minPrice, maxPrice }) => (
            <li key={slug}>
              <h2>
                <Link href={`/catalog/${slug}`}>{name}</Link>
              </h2>
              <p>
                {categoryName} · PO {batchLabel}
                {closesAt && ` · ditutup ${formatDateTime(closesAt)}`}
              </p>
              {minPrice !== null && maxPrice !== null && (
                <p>{minPrice === maxPrice ? formatRupiah(minPrice) : `${formatRupiah(minPrice)} – ${formatRupiah(maxPrice)}`}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default CatalogPage;
