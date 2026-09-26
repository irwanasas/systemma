"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { ValuePoint } from "@/features/dashboard/buckets";
import { formatRupiah, formatRupiahCompact, toRupiah } from "@/lib/money";

const chartLoading = (): React.ReactNode => <Skeleton className="size-full rounded-lg" />;

const ValueLineChart = dynamic(() => import("@/components/charts/value-line-chart"), { ssr: false, loading: chartLoading });

const ValueBarChart = dynamic(() => import("@/components/charts/value-bar-chart"), { ssr: false, loading: chartLoading });

type ChartCardProps = {
  id: string;
  title: string;
  description: string;
  kind: "line" | "bar" | "bar-horizontal";
  unit: "rupiah" | "pcs";
  data: ValuePoint[];
  className?: string;
};

const formatters = {
  rupiah: { value: (value: number) => formatRupiah(toRupiah(value)), tick: formatRupiahCompact },
  pcs: { value: (value: number) => `${value} pcs`, tick: (value: number) => String(value) },
};

export const ChartCard = ({ id, title, description, kind, unit, data, className }: ChartCardProps): React.ReactNode => {
  const { value: formatValue, tick: formatTick } = formatters[unit];
  const hasData = data.some(({ value }) => value > 0);
  const height = kind === "bar-horizontal" ? Math.max(160, data.length * 44 + 40) : 256;
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5 ${className ?? ""}`}>
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="text-base sm:text-lg">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {hasData ? (
        <div role="group" aria-label={`Grafik ${title}`} style={{ height }}>
          {kind === "line" ? (
            <ValueLineChart data={data} seriesName={title} formatValue={formatValue} />
          ) : (
            <ValueBarChart
              data={data}
              seriesName={title}
              formatValue={formatValue}
              formatTick={formatTick}
              layout={kind === "bar-horizontal" ? "vertical" : "horizontal"}
            />
          )}
        </div>
      ) : (
        <p className="flex items-center justify-center rounded-lg bg-muted text-ui text-muted-foreground" style={{ height: 160 }}>
          Belum ada data untuk periode ini.
        </p>
      )}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Periode</th>
            <th scope="col">Nilai</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ label, value }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{formatValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
