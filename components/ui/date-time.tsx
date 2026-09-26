import { formatDateTime, formatShortDateTime } from "@/lib/dates";

export const DateTime = ({ value }: { value: string }): React.ReactNode => (
  <time dateTime={value} title={formatDateTime(value)} className="whitespace-nowrap tabular-nums">
    {formatShortDateTime(value)}
  </time>
);
