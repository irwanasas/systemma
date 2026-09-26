import { CaretDown, ChartBar, DownloadSimple } from "@phosphor-icons/react/ssr";
import { ChartCard } from "@/components/charts/chart-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { dailyValues } from "@/features/dashboard/buckets";
import { listOrderValues } from "@/features/dashboard/server/queries";
import { jakartaToday, parseRecapPeriod, recapPresets } from "@/features/recap/period";
import { getRecapRows } from "@/features/recap/server/queries";
import { RECAP_CATEGORIES, summarizeRecap } from "@/features/recap/summarize";
import { requireRole } from "@/lib/auth/require-role";
import { formatDate } from "@/lib/dates";
import { buildHref } from "@/lib/list-params";
import { formatRupiah } from "@/lib/money";

const RecapPage = async ({ searchParams }: PageProps<"/recap">): Promise<React.ReactNode> => {
  await requireRole("admin");
  const { from, to } = await searchParams;
  const period = parseRecapPeriod(from, to);
  const [recapRows, orderValues] = await Promise.all([
    getRecapRows(period),
    listOrderValues(period.fromIso, period.toExclusiveIso),
  ]);
  const summary = summarizeRecap(recapRows);
  const agentValues = [...summary.agents]
    .sort((first, second) => second.totals.orderValue - first.totals.orderValue)
    .map((agent) => ({ label: agent.agentName, value: agent.totals.orderValue }));
  const exportHref = `/recap/export?${new URLSearchParams({ from: period.from, to: period.to })}`;
  const presets = recapPresets(jakartaToday()).map(({ label, from: presetFrom, to: presetTo }) => ({
    label,
    href: buildHref("/recap", { from: presetFrom, to: presetTo }),
    active: presetFrom === period.from && presetTo === period.to,
  }));
  const tiles = [
    { label: "Total pcs", value: `${summary.totals.qty} pcs` },
    { label: "Nilai pesanan", value: formatRupiah(summary.totals.orderValue) },
    { label: "DP diterima", value: formatRupiah(summary.totals.dpReceived) },
    { label: "Pelunasan diterima", value: formatRupiah(summary.totals.settlementReceived) },
  ];

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Rekap</h1>
        <Button asChild variant="outline" className="min-h-[var(--control-height)] text-ui">
          <a href={exportHref} className="text-foreground no-underline hover:no-underline">
            <DownloadSimple aria-hidden="true" weight="bold" />
            Unduh XLSX
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <FilterChips label="Periode cepat" chips={presets} />
        <form method="get" className="!flex-row !flex-wrap !items-end !gap-2">
          <div className="!w-auto">
            <label htmlFor="from">Dari tanggal</label>
            <input id="from" name="from" type="date" defaultValue={period.from} />
          </div>
          <div className="!w-auto">
            <label htmlFor="to">Sampai tanggal</label>
            <input id="to" name="to" type="date" defaultValue={period.to} />
          </div>
          <Button type="submit" variant="outline" className="min-h-[var(--control-height)] text-ui">
            Terapkan
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">
          Pesanan yang dibuat {formatDate(period.fromIso)} sampai {formatDate(`${period.to}T12:00:00+07:00`)}. Pesanan
          dibatalkan dan kedaluwarsa tidak dihitung; DP dan pelunasan adalah dana yang sudah diterima.
        </p>
      </div>

      <section aria-labelledby="totals-heading" className="flex flex-col gap-3">
        <h2 id="totals-heading">Total periode</h2>
        <dl className="!grid grid-cols-2 gap-3 xl:grid-cols-4">
          {tiles.map(({ label, value }) => (
            <div key={label} className="flex min-w-0 flex-col gap-1 rounded-xl border border-border border-t-[3px] border-t-ochre bg-surface p-3 sm:p-4">
              <dt className="text-sm sm:text-ui">{label}</dt>
              <dd className="text-base font-semibold break-words tabular-nums sm:text-xl">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="flex max-w-none flex-wrap gap-x-4 gap-y-1 text-ui text-muted-foreground">
          {RECAP_CATEGORIES.map(({ code, name }) => (
            <span key={code}>
              {name} <span className="font-semibold text-foreground tabular-nums">{summary.qtyByCategory[code]} pcs</span>
            </span>
          ))}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          id="daily-chart-heading"
          title="Nilai pesanan per hari"
          description="Periode yang dipilih, tanpa pesanan dibatalkan dan kedaluwarsa."
          kind="line"
          unit="rupiah"
          data={dailyValues(orderValues, period.from, period.to)}
        />
        <ChartCard
          id="agent-chart-heading"
          title="Nilai pesanan per agen"
          description="Periode yang dipilih."
          kind="bar-horizontal"
          unit="rupiah"
          data={agentValues}
        />
      </div>

      {summary.agents.length === 0 ? (
        <EmptyState icon={ChartBar} title="Tidak ada pesanan" description="Tidak ada pesanan pada periode ini." />
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="text-base">Per agen</h2>
          {summary.agents.map((agent) => (
            <section key={agent.agentId} aria-labelledby={`agent-${agent.agentId}`}>
              <details className="group rounded-xl border border-border bg-surface">
                <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
                  <h3 id={`agent-${agent.agentId}`} className="flex items-center gap-2">
                    <CaretDown aria-hidden="true" className="size-4 shrink-0 transition-transform group-open:rotate-180" />
                    {agent.agentName} ({agent.agentCode})
                  </h3>
                  <span className="text-ui text-muted-foreground tabular-nums">
                    {agent.totals.qty} pcs · <span className="font-semibold text-foreground">{formatRupiah(agent.totals.orderValue)}</span>
                  </span>
                </summary>
                <div className="overflow-x-auto border-t border-border">
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
              </details>
            </section>
          ))}
        </div>
      )}
    </main>
  );
};

export default RecapPage;
