import { cn } from "@/lib/utils";

export type SummaryRow = { label: React.ReactNode; value: React.ReactNode; strong?: boolean };

export const SummaryList = ({ rows, className }: { rows: SummaryRow[]; className?: string }): React.ReactNode => (
  <dl className={cn("!flex flex-col gap-1.5 text-ui", className)}>
    {rows.map(({ label, value, strong }, index) => (
      <div key={index} className={cn("flex items-baseline justify-between gap-4", strong && "text-base font-semibold")}>
        <dt className={cn(strong && "text-foreground")}>{label}</dt>
        <dd className="text-right tabular-nums">{value}</dd>
      </div>
    ))}
  </dl>
);
