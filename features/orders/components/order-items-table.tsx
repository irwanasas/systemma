import { SectionCard } from "@/components/ui/section-card";
import { SummaryList } from "@/components/ui/summary-list";
import { describeSize } from "@/features/orders/format";
import type { OrderDetail } from "@/features/orders/types";
import { formatRupiah } from "@/lib/money";

export const OrderItemsTable = ({ order }: { order: OrderDetail }): React.ReactNode => (
  <SectionCard id="items-heading" title="Barang">
    <div className="hidden overflow-x-auto sm:block">
      <table>
        <thead>
          <tr>
            <th scope="col">Warna</th>
            <th scope="col">Ukuran</th>
            <th scope="col" className="text-right">
              Harga per pcs
            </th>
            <th scope="col" className="text-right">
              Jumlah
            </th>
            <th scope="col" className="text-right">
              Total
            </th>
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
    <ul className="divide-y divide-border sm:hidden">
      {order.items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">
              {item.colorName} · {describeSize(item.sizeCode, item.customChestCm, item.customLengthCm)}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {item.qty} × {formatRupiah(item.unitPrice)}
            </span>
          </span>
          <span className="shrink-0 font-semibold tabular-nums">{formatRupiah(item.lineTotal)}</span>
        </li>
      ))}
    </ul>
    <SummaryList
      className="border-t border-border pt-3 sm:ml-auto sm:w-72"
      rows={[
        { label: "Subtotal", value: formatRupiah(order.subtotal) },
        { label: "DP", value: formatRupiah(order.dpAmount) },
        { label: "Pelunasan", value: formatRupiah(order.settlementAmount) },
      ]}
    />
    <p className="text-sm text-muted-foreground">Ongkos kirim diatur terpisah di luar sistem.</p>
  </SectionCard>
);
