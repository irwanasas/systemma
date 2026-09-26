import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  hrefFor: (page: number) => string;
};

export const Pagination = ({ page, pageCount, total, hrefFor }: PaginationProps): React.ReactNode => {
  if (pageCount <= 1) return null;
  const pageButton = (target: number, label: string, icon: React.ReactNode, iconFirst: boolean) =>
    target < 1 || target > pageCount ? (
      <Button variant="outline" size="sm" disabled className="min-h-9 text-ui">
        {iconFirst && icon}
        {label}
        {!iconFirst && icon}
      </Button>
    ) : (
      <Button asChild variant="outline" size="sm" className="min-h-9 text-ui">
        <Link href={hrefFor(target)} className="text-foreground no-underline">
          {iconFirst && icon}
          {label}
          {!iconFirst && icon}
        </Link>
      </Button>
    );
  return (
    <nav aria-label="Halaman" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        Halaman {page} dari {pageCount} · {total} data
      </p>
      <div className="flex gap-2">
        {pageButton(page - 1, "Sebelumnya", <CaretLeft aria-hidden="true" />, true)}
        {pageButton(page + 1, "Berikutnya", <CaretRight aria-hidden="true" />, false)}
      </div>
    </nav>
  );
};
