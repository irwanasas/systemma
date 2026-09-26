import Link from "next/link";
import { CheckCircle, Package } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { ListPager, ListSearch } from "@/components/ui/list-controls";
import { TableCard } from "@/components/ui/table-card";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { type OrderSummary } from "@/features/orders/types";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

type AgentOrderListProps = {
  result: { items: OrderSummary[]; total: number; page: number; pageSize: number };
  placedOrders: OrderSummary[];
  query: string | undefined;
};

export const AgentOrderList = ({ result, placedOrders, query }: AgentOrderListProps): React.ReactNode => {
  const orders = result.items;
  return (
    <main>
      <h1>Pesanan</h1>
      {placedOrders.length > 0 && (
        <section role="status" aria-labelledby="placed-heading" className="!flex !flex-col gap-2 rounded-xl">
          <h2 id="placed-heading" className="flex items-center gap-2 text-base">
            <CheckCircle aria-hidden="true" weight="fill" className="size-5 text-success" />
            Checkout berhasil
          </h2>
          <ul className="flex flex-col gap-1.5 text-ui">
            {placedOrders.map(({ id, number, createdAt, dpAmount, dpDueAt }) => (
              <li key={id}>
                Pesanan{" "}
                <Link href={`/orders/${id}`} className="font-semibold">
                  {number}
                </Link>{" "}
                dibuat {formatDateTime(createdAt)}. Bayar DP {formatRupiah(dpAmount)} paling lambat{" "}
                <strong>{formatDateTime(dpDueAt)}</strong>.
              </li>
            ))}
          </ul>
        </section>
      )}
      {(result.total > 0 || query) && <ListSearch label="Cari pesanan" placeholder="Nomor pesanan atau seri" />}
      {result.total === 0 && query ? (
        <EmptyState icon={Package} title="Tidak ada pesanan" description="Tidak ada pesanan yang cocok dengan pencarian ini." />
      ) : result.total === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum ada pesanan"
          description="Pesanan muncul di sini setelah checkout dari keranjang."
          action={
            <Button asChild className="min-h-11 text-ui">
              <Link href="/catalog" className="text-primary-foreground no-underline">
                Buka katalog
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <TableCard className="hidden md:block">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nomor</th>
                  <th scope="col">Seri</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Subtotal
                  </th>
                  <th scope="col" className="text-right">
                    DP
                  </th>
                  <th scope="col">Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(({ id, number, productName, batchLabel, status, subtotal, dpAmount, createdAt }) => (
                  <tr key={id}>
                    <td className="whitespace-nowrap">
                      <Link href={`/orders/${id}`}>{number}</Link>
                    </td>
                    <td>
                      {productName} · {batchLabel}
                    </td>
                    <td>
                      <OrderStatusBadge status={status} />
                    </td>
                    <td className="text-right">{formatRupiah(subtotal)}</td>
                    <td className="text-right">{formatRupiah(dpAmount)}</td>
                    <td>
                      <DateTime value={createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface md:hidden">
            {orders.map(({ id, number, productName, batchLabel, status, subtotal, createdAt }) => (
              <li key={id} className="relative flex flex-col gap-1.5 p-4">
                <span className="flex items-start justify-between gap-3">
                  <Link href={`/orders/${id}`} className="font-semibold text-foreground after:absolute after:inset-0">
                    {number}
                  </Link>
                  <span className="text-ui font-semibold tabular-nums">{formatRupiah(subtotal)}</span>
                </span>
                <span className="text-ui">
                  {productName} · PO {batchLabel}
                </span>
                <span className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <OrderStatusBadge status={status} />
                  <DateTime value={createdAt} />
                </span>
              </li>
            ))}
          </ul>
          <ListPager total={result.total} page={result.page} pageSize={result.pageSize} />
        </>
      )}
    </main>
  );
};
