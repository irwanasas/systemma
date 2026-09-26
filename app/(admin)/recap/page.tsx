import { DownloadSimple } from "@phosphor-icons/react/ssr";
import { parseRecapPeriod } from "@/features/recap/period";
import { getRecapRows } from "@/features/recap/server/queries";
import { RECAP_CATEGORIES, summarizeRecap } from "@/features/recap/summarize";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const RecapPage = async ({ searchParams }: PageProps<"/recap">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const { from, to } = await searchParams;
  const period = parseRecapPeriod(from, to);
  const summary = summarizeRecap(await getRecapRows(period));
  const exportHref = `/recap/export?${new URLSearchParams({ from: period.from, to: period.to })}`;

  return (
    <main>
      <h1>Rekap</h1>
      <form method="get" className="!flex-row flex-wrap !items-end">
        <div className="!w-auto">
          <label htmlFor="from">Dari tanggal</label>
          <input id="from" name="from" type="date" defaultValue={period.from} />
        </div>
        <div className="!w-auto">
          <label htmlFor="to">Sampai tanggal</label>
          <input id="to" name="to" type="date" defaultValue={period.to} />
        </div>
        <button type="submit">Terapkan</button>
      </form>
      <p className="text-sm text-muted-foreground">
        Pesanan yang dibuat {formatDate(period.fromIso)} sampai {formatDate(`${period.to}T12:00:00+07:00`)}. Pesanan dibatalkan
        dan kedaluwarsa tidak dihitung; DP dan pelunasan adalah dana yang sudah diterima.
      </p>
      <p>
        <a href={exportHref} className="inline-flex items-center gap-1 font-semibold">
          <DownloadSimple aria-hidden="true" weight="bold" />
          Unduh XLSX
        </a>
      </p>

      <section aria-labelledby="totals-heading" className="rounded-lg border border-border bg-surface p-4">
        <h2 id="totals-heading">Total periode</h2>
        <dl>
          {RECAP_CATEGORIES.map(({ code, name }) => (
            <div key={code} className="contents">
              <dt>{name}</dt>
              <dd>{summary.qtyByCategory[code]} pcs</dd>
            </div>
          ))}
          <dt>Total pcs</dt>
          <dd className="font-semibold">{summary.totals.qty} pcs</dd>
          <dt>Nilai pesanan</dt>
          <dd className="font-semibold">{formatRupiah(summary.totals.orderValue)}</dd>
          <dt>DP diterima</dt>
          <dd>{formatRupiah(summary.totals.dpReceived)}</dd>
          <dt>Pelunasan diterima</dt>
          <dd>{formatRupiah(summary.totals.settlementReceived)}</dd>
        </dl>
      </section>

      {summary.agents.length === 0 ? (
        <p>Tidak ada pesanan pada periode ini.</p>
      ) : (
        summary.agents.map((agent) => (
          <section key={agent.agentId} aria-labelledby={`agent-${agent.agentId}`} className="rounded-lg border border-border bg-surface p-4">
            <h2 id={`agent-${agent.agentId}`}>
              {agent.agentName} ({agent.agentCode})
            </h2>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Kategori</th>
                    <th scope="col">Seri</th>
                    <th scope="col">Batch</th>
                    <th scope="col" className="text-right">
                      Pesanan
                    </th>
                    <th scope="col" className="text-right">
                      Pcs
                    </th>
                    <th scope="col" className="text-right">
                      Nilai
                    </th>
                    <th scope="col" className="text-right">
                      DP diterima
                    </th>
                    <th scope="col" className="text-right">
                      Pelunasan diterima
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agent.rows.map((row) => (
                    <tr key={`${row.productName}-${row.batchLabel}`}>
                      <td>{row.categoryName}</td>
                      <td>{row.productName}</td>
                      <td>{row.batchLabel}</td>
                      <td className="text-right">{row.orderCount}</td>
                      <td className="text-right">{row.qty}</td>
                      <td className="text-right">{formatRupiah(row.orderValue)}</td>
                      <td className="text-right">{formatRupiah(row.dpReceived)}</td>
                      <td className="text-right">{formatRupiah(row.settlementReceived)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <th scope="row" colSpan={4}>
                      Total · {RECAP_CATEGORIES.map(({ code, name }) => `${name} ${agent.qtyByCategory[code]}`).join(" · ")}
                    </th>
                    <td className="text-right">{agent.totals.qty}</td>
                    <td className="text-right">{formatRupiah(agent.totals.orderValue)}</td>
                    <td className="text-right">{formatRupiah(agent.totals.dpReceived)}</td>
                    <td className="text-right">{formatRupiah(agent.totals.settlementReceived)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        ))
      )}
    </main>
  );
};

export default RecapPage;
