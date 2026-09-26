"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axisProps, tooltipProps } from "@/components/charts/chart-theme";
import type { ValuePoint } from "@/features/dashboard/buckets";
import { formatRupiahCompact } from "@/lib/money";

type ValueLineChartProps = {
  data: ValuePoint[];
  seriesName: string;
  formatValue: (value: number) => string;
};

const ValueLineChart = ({ data, seriesName, formatValue }: ValueLineChartProps): React.ReactNode => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
      <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
      <YAxis {...axisProps} width={72} tickFormatter={(value: number) => formatRupiahCompact(value)} />
      <Tooltip {...tooltipProps} formatter={(value) => [formatValue(Number(value)), seriesName]} />
      <Line
        type="monotone"
        dataKey="value"
        name={seriesName}
        stroke="var(--color-chart-1)"
        strokeWidth={2.5}
        dot={{ r: 3, fill: "var(--color-chart-1)", strokeWidth: 0 }}
        activeDot={{ r: 5 }}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

export default ValueLineChart;
