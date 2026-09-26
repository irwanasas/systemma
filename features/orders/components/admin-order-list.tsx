import Link from "next/link";
import { Receipt } from "@phosphor-icons/react/ssr";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { ListPager, ListSearch } from "@/components/ui/list-controls";
import { TableCard } from "@/components/ui/table-card";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ORDER_STATUSES, orderStatusLabels, type OrderStatus, type OrderSummary } from "@/features/orders/types";
import { buildHref } from "@/lib/list-params";
import { formatRupiah } from "@/lib/money";

type AdminOrderListProps = {
  result: { items: OrderSummary[]; total: number; page: number; pageSize: number };
  status: OrderStatus | null;
  query: string | undefined;
};

export const AdminOrderList = ({ result, status, query }: AdminOrderListProps): React.ReactNode => {
  const size = result.pageSize === 20 ? undefined : String(result.pageSize);
  const chips = [
    { label: "Semua", href: buildHref("/orders", { q: query, size }), active: status === null },
    ...ORDER_STATUSES.map((option) => ({
      label: orderStatusLabels[option],
      href: buildHref("/orders", { status: option, q: query, size }),
      active: status === option,
    })),
  ];
  return (
    <main>
      <h1>Pesanan</h1>
      <div className="flex flex-col gap-3">
        <ListSearch label="Cari pesanan" placeholder="Nomor, agen, atau seri" />
        <FilterChips label="Filter status" chips={chips} />
      </div>
      {result.total === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Tidak ada pesanan"
          description={query || status ? "Tidak ada pesanan yang cocok dengan filter ini." : "Belum ada pesanan masuk."}
        />
      ) : (
        <>
          <TableCard className="hidden md:block">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nomor</th>
                  <th scope="col">Agen</th>
                  <th scope="col">Seri</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Subtotal
                  </th>
                  <th scope="col">Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap">
                      <Link href={`/orders/${order.id}`}>{order.number}</Link>
                    </td>
                    <td>
                      {order.agentName} <span className="text-muted-foreground">({order.agentCode})</span>
                    </td>
                    <td>
                      {order.productName} · {order.batchLabel}
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="text-right">{formatRupiah(order.subtotal)}</td>
                    <td>
                      <DateTime value={order.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface md:hidden">
            {result.items.map((order) => (
              <li key={order.id} className="relative flex flex-col gap-1.5 p-4">
                <span className="flex items-start justify-between gap-3">
                  <Link href={`/orders/${order.id}`} className="font-semibold text-foreground after:absolute after:inset-0">
                    {order.number}
                  </Link>
                  <span className="text-ui font-semibold tabular-nums">{formatRupiah(order.subtotal)}</span>
                </span>
                <span className="text-ui">
                  {order.agentName} ({order.agentCode}) · {order.productName} {order.batchLabel}
                </span>
                <span className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <OrderStatusBadge status={order.status} />
                  <DateTime value={order.createdAt} />
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
