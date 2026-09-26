import Link from "next/link";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { ORDER_STATUSES, orderStatusLabels, type OrderStatus, type OrderSummary } from "@/features/orders/types";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

type AdminOrderListProps = {
  orders: OrderSummary[];
  status: OrderStatus | null;
};

export const AdminOrderList = ({ orders, status }: AdminOrderListProps): React.ReactNode => (
  <main>
    <h1>Pesanan</h1>
    <form method="get" className="!flex-row flex-wrap !items-end">
      <div className="!w-auto">
      <label htmlFor="status">Filter status</label>
      <select id="status" name="status" defaultValue={status ?? ""}>
        <option value="">Semua status</option>
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {orderStatusLabels[option]}
          </option>
        ))}
      </select>
      </div>
      <button type="submit">Terapkan</button>
    </form>
    {orders.length === 0 ? (
      <p>Tidak ada pesanan.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th scope="col">Nomor</th>
            <th scope="col">Agen</th>
            <th scope="col">Seri</th>
            <th scope="col">Status</th>
            <th scope="col">Subtotal</th>
            <th scope="col">Dibuat</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(({ id, number, agentName, agentCode, productName, batchLabel, status: orderStatus, subtotal, createdAt }) => (
            <tr key={id}>
              <td>
                <Link href={`/orders/${id}`}>{number}</Link>
              </td>
              <td>
                {agentName} ({agentCode})
              </td>
              <td>
                {productName} · {batchLabel}
              </td>
              <td><OrderStatusBadge status={orderStatus} /></td>
              <td>{formatRupiah(subtotal)}</td>
              <td>{formatDateTime(createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </main>
);
