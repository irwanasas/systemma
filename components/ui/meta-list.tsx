import { cn } from "@/lib/utils";

export type MetaItem = { label: string; value: React.ReactNode };

export const MetaList = ({ items, className }: { items: MetaItem[]; className?: string }): React.ReactNode => (
  <dl className={cn("!grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2", className)}>
    {items.map(({ label, value }) => (
      <div key={label} className="flex flex-col gap-0.5">
        <dt className="text-sm">{label}</dt>
        <dd className="text-ui font-medium">{value}</dd>
      </div>
    ))}
  </dl>
);
