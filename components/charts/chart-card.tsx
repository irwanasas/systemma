"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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
  kind: "line" | "bar" | "bar-horizontal" | "bar-daily";
  unit: "rupiah" | "pcs";
  data: ValuePoint[];
  className?: string;
};

const formatters = {
  rupiah: { value: (value: number) => formatRupiah(toRupiah(value)), tick: formatRupiahCompact },
  pcs: { value: (value: number) => `${value} pcs`, tick: (value: number) => String(value) },
};

const useNearViewportWhenIdle = (): [React.RefObject<HTMLDivElement | null>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    let idleHandle: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const markReady = (): void => setReady(true);
        idleHandle = hasIdleCallback ? window.requestIdleCallback(markReady, { timeout: 2000 }) : window.setTimeout(markReady, 200);
      },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (idleHandle === undefined) return;
      if (hasIdleCallback) window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
    };
  }, []);
  return [ref, ready];
};

export const ChartCard = ({ id, title, description, kind, unit, data, className }: ChartCardProps): React.ReactNode => {
  const { value: formatValue, tick: formatTick } = formatters[unit];
  const hasData = data.some(({ value }) => value > 0);
  const height = kind === "bar-horizontal" ? Math.max(160, data.length * 44 + 40) : 256;
  const [chartRef, chartReady] = useNearViewportWhenIdle();
  return (
    <section aria-labelledby={id} className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5 ${className ?? ""}`}>
      <div className="flex flex-col gap-0.5">
        <h2 id={id} className="text-base sm:text-lg">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {hasData ? (
        <div ref={chartRef} role="group" aria-label={`Grafik ${title}`} style={{ height }}>
          {!chartReady ? (
            chartLoading()
          ) : kind === "line" ? (
            <ValueLineChart data={data} seriesName={title} formatValue={formatValue} />
          ) : (
            <ValueBarChart
              data={data}
              seriesName={title}
              formatValue={formatValue}
              formatTick={formatTick}
              layout={kind === "bar-horizontal" ? "vertical" : "horizontal"}
              timeSeries={kind === "bar-daily"}
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
