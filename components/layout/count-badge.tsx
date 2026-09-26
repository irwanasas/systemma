import { cn } from "@/lib/utils";

export const CountBadge = ({ count, className }: { count: number; className?: string }): React.ReactNode =>
  count > 0 ? (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs leading-5 font-semibold text-primary-foreground tabular-nums",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  ) : null;
