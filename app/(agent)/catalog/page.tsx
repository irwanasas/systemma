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
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(({ slug, name, categoryName, batchLabel, closesAt, minPrice, maxPrice }) => (
            <li key={slug} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {categoryName} · PO {batchLabel}
              </p>
              <h2>
                <Link href={`/catalog/${slug}`} className="text-foreground">
                  {name}
                </Link>
              </h2>
              {minPrice !== null && maxPrice !== null && (
                <p className="font-semibold tabular-nums">
                  {minPrice === maxPrice ? formatRupiah(minPrice) : `${formatRupiah(minPrice)} – ${formatRupiah(maxPrice)}`}
                </p>
              )}
              {closesAt && <p className="text-sm text-muted-foreground">Ditutup {formatDateTime(closesAt)}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default CatalogPage;
