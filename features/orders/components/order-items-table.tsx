import { describeSize } from "@/features/orders/format";
import type { OrderDetail } from "@/features/orders/types";
import { formatRupiah } from "@/lib/money";

export const OrderItemsTable = ({ order }: { order: OrderDetail }): React.ReactNode => (
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
    <p>Ongkos kirim diatur terpisah di luar sistem.</p>
  </section>
);
