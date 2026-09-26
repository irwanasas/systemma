import Link from "next/link";
import { listAgentOrders } from "@/features/orders/server/queries";
import { orderStatusLabels } from "@/features/orders/types";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const OrdersPage = async ({ searchParams }: PageProps<"/orders">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const { placed } = await searchParams;
  const orders = await listAgentOrders(user.id);
  const placedNumbers = typeof placed === "string" ? placed.split(",") : [];
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

export default OrdersPage;
