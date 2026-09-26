import Link from "next/link";
import { orderStatusLabels, type OrderSummary } from "@/features/orders/types";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

type AgentOrderListProps = {
  orders: OrderSummary[];
  placedNumbers: string[];
};

export const AgentOrderList = ({ orders, placedNumbers }: AgentOrderListProps): React.ReactNode => {
  const placedOrders = orders.filter(({ number }) => placedNumbers.includes(number));
  return (
    <main>
      <h1>Pesanan</h1>
      {placedOrders.length > 0 && (
        <section role="status" aria-labelledby="placed-heading">
          <h2 id="placed-heading">Checkout berhasil</h2>
          <ul>
            {placedOrders.map(({ id, number, createdAt, dpAmount, dpDueAt }) => (
              <li key={id}>
                Pesanan <Link href={`/orders/${id}`}>{number}</Link> dibuat {formatDateTime(createdAt)}. Bayar DP{" "}
                {formatRupiah(dpAmount)} paling lambat {formatDateTime(dpDueAt)}.
              </li>
            ))}
          </ul>
        </section>
      )}
      {orders.length === 0 ? (
        <p>Belum ada pesanan.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Nomor</th>
              <th scope="col">Seri</th>
              <th scope="col">Status</th>
              <th scope="col">Subtotal</th>
              <th scope="col">DP</th>
              <th scope="col">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(({ id, number, productName, batchLabel, status, subtotal, dpAmount, createdAt }) => (
              <tr key={id}>
                <td>
                  <Link href={`/orders/${id}`}>{number}</Link>
                </td>
                <td>
                  {productName} · {batchLabel}
                </td>
                <td>{orderStatusLabels[status]}</td>
                <td>{formatRupiah(subtotal)}</td>
                <td>{formatRupiah(dpAmount)}</td>
                <td>{formatDateTime(createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};
