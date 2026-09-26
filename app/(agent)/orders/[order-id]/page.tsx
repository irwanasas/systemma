import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { describeSize } from "@/features/orders/format";
import { cancelOrder } from "@/features/orders/server/actions";
import { getOrderDetail } from "@/features/orders/server/queries";
import { orderStatusLabels } from "@/features/orders/types";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const AgentOrderPage = async ({ params }: PageProps<"/orders/[order-id]">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  const { "order-id": orderId } = await params;
  const order = await getOrderDetail(orderId);
  if (!order || order.agentId !== user.id) notFound();

  return (
    <main>
      <p>
        <Link href="/orders">Kembali ke daftar pesanan</Link>
      </p>
      <h1>Pesanan {order.number}</h1>
      <dl>
        <dt>Status</dt>
        <dd>{orderStatusLabels[order.status]}</dd>
        <dt>Seri</dt>
        <dd>
          {order.productName} · PO {order.batchLabel}
        </dd>
        <dt>Dibuat</dt>
        <dd>{formatDateTime(order.createdAt)}</dd>
        {order.status === "AWAITING_DP" && (
          <>
            <dt>Batas bayar DP</dt>
            <dd>{formatDateTime(order.dpDueAt)}</dd>
          </>
        )}
        {order.etaAt && (
          <>
            <dt>Estimasi selesai</dt>
            <dd>{formatDateTime(order.etaAt)}</dd>
          </>
        )}
      </dl>

      <section aria-labelledby="items-heading">
        <h2 id="items-heading">Barang</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Warna</th>
              <th scope="col">Ukuran</th>
              <th scope="col">Harga per pcs</th>
              <th scope="col">Jumlah</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.colorName}</td>
                <td>{describeSize(item.sizeCode, item.customChestCm, item.customLengthCm)}</td>
                <td>{formatRupiah(item.unitPrice)}</td>
                <td>{item.qty}</td>
                <td>{formatRupiah(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl>
          <dt>Subtotal</dt>
          <dd>{formatRupiah(order.subtotal)}</dd>
          <dt>DP</dt>
          <dd>{formatRupiah(order.dpAmount)}</dd>
          <dt>Pelunasan</dt>
          <dd>{formatRupiah(order.settlementAmount)}</dd>
        </dl>
      </section>

      {order.status === "AWAITING_DP" && (
        <section aria-labelledby="cancel-heading">
          <h2 id="cancel-heading">Batalkan pesanan</h2>
          <p>Pesanan hanya bisa dibatalkan sebelum bukti DP dikirim.</p>
          <ActionForm
            action={cancelOrder}
            submitLabel="Batalkan pesanan"
            pendingLabel="Membatalkan…"
            confirmMessage={`Batalkan pesanan ${order.number}?`}
          >
            <input type="hidden" name="orderId" value={order.id} />
          </ActionForm>
        </section>
      )}
    </main>
  );
};

export default AgentOrderPage;
