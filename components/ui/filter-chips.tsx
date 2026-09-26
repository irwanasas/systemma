import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterChip = { label: string; href: string; active: boolean; count?: number };

export const FilterChips = ({ label, chips }: { label: string; chips: FilterChip[] }): React.ReactNode => (
  <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
    <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
      {chips.map(({ label: chipLabel, href, active, count }) => (
        <li key={href}>
          <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-ui whitespace-nowrap text-foreground no-underline transition-colors duration-150 hover:bg-muted hover:no-underline",
              active ? "border-primary bg-primary-soft font-semibold text-primary-strong hover:bg-primary-soft" : "border-border bg-surface",
            )}
          >
            {chipLabel}
            {count !== undefined && <span className="text-sm text-muted-foreground tabular-nums">{count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
