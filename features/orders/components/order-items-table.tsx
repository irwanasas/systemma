import { describeSize } from "@/features/orders/format";
import type { OrderDetail } from "@/features/orders/types";
import { formatRupiah } from "@/lib/money";

export const OrderItemsTable = ({ order }: { order: OrderDetail }): React.ReactNode => (
  <section aria-labelledby="items-heading" className="rounded-lg border border-border bg-surface p-4">
    <h2 id="items-heading">Barang</h2>
    <div className="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th scope="col">Warna</th>
          <th scope="col">Ukuran</th>
          <th scope="col" className="text-right">Harga per pcs</th>
          <th scope="col" className="text-right">Jumlah</th>
          <th scope="col" className="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((item) => (
          <tr key={item.id}>
            <td>{item.colorName}</td>
            <td>{describeSize(item.sizeCode, item.customChestCm, item.customLengthCm)}</td>
            <td className="text-right">{formatRupiah(item.unitPrice)}</td>
            <td className="text-right">{item.qty}</td>
            <td className="text-right">{formatRupiah(item.lineTotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
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
