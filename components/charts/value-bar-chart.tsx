"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, tooltipProps } from "@/components/charts/chart-theme";
import type { ValuePoint } from "@/features/dashboard/buckets";

type ValueBarChartProps = {
  data: ValuePoint[];
  seriesName: string;
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  layout?: "vertical" | "horizontal";
};

const SERIES = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const ValueBarChart = ({ data, seriesName, formatValue, formatTick, layout = "horizontal" }: ValueBarChartProps): React.ReactNode => {
  const isVertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={isVertical ? "vertical" : "horizontal"} margin={{ top: 20, right: isVertical ? 72 : 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={!isVertical} vertical={isVertical} />
        {isVertical ? (
          <>
            <XAxis type="number" {...axisProps} tickFormatter={formatTick} />
            <YAxis type="category" dataKey="label" {...axisProps} width={112} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={56} tickFormatter={formatTick} allowDecimals={false} />
          </>
        )}
        <Tooltip {...tooltipProps} formatter={(value) => [formatValue(Number(value)), seriesName]} />
        <Bar dataKey="value" name={seriesName} radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
          {data.map(({ label }, index) => (
            <Cell key={label} fill={SERIES[index % SERIES.length]} />
          ))}
          <LabelList
            dataKey="value"
            position={isVertical ? "right" : "top"}
            formatter={(value) => formatTick(Number(value))}
            fill="var(--color-foreground)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ValueBarChart;
