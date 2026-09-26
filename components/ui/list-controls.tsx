"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretDoubleLeft, CaretDoubleRight, CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { PAGE_SIZES, pageRange } from "@/lib/list-params";
import { cn } from "@/lib/utils";

const useHrefWith = (): ((updates: Record<string, string | null>) => string) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };
};

type ListSearchProps = { label: string; placeholder: string };

export const ListSearch = ({ label, placeholder }: ListSearchProps): React.ReactNode => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hrefWith = useHrefWith();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const lastPushed = useRef(initialQuery.trim());

  const push = (value: string): void => {
    lastPushed.current = value;
    router.replace(hrefWith({ q: value || null, page: null }), { scroll: false });
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === lastPushed.current) return;
    const timeout = window.setTimeout(() => push(trimmed), 300);
    return () => window.clearTimeout(timeout);
  });

  return (
    <form
      role="search"
      className="!flex-row !items-center"
      onSubmit={(event) => {
        event.preventDefault();
        push(query.trim());
      }}
    >
      <div className="relative !w-full sm:!w-80">
        <label htmlFor="list-search" className="sr-only">
          {label}
        </label>
        <MagnifyingGlass aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="list-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="!max-w-none pl-9"
        />
      </div>
    </form>
  );
};

const pagerClass =
  "inline-flex min-h-[var(--control-height)] min-w-[var(--control-height)] items-center justify-center rounded-md border border-border bg-surface text-foreground no-underline transition-colors duration-150 hover:bg-muted hover:no-underline";

type ListPagerProps = { total: number; page: number; pageSize: number };

export const ListPager = ({ total, page, pageSize }: ListPagerProps): React.ReactNode => {
  const router = useRouter();
  const hrefWith = useHrefWith();
  const { from, to, pageCount } = pageRange(page, pageSize, total);

  const pageLink = (target: number, label: string, icon: React.ReactNode): React.ReactNode =>
    target < 1 || target > pageCount || target === page ? (
      <span aria-disabled="true" className={cn(pagerClass, "opacity-50")}>
        {icon}
        <span className="sr-only">{label}</span>
      </span>
    ) : (
      <Link href={hrefWith({ page: target > 1 ? String(target) : null })} scroll={false} className={pagerClass} title={label}>
        {icon}
        <span className="sr-only">{label}</span>
      </Link>
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p aria-live="polite" className="tabular-nums">
        {total === 0 ? "Tidak ada data" : `Menampilkan ${from}–${to} dari ${total}`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="page-size" className="!m-0 flex items-center gap-2 !text-sm !font-normal">
          Per halaman
          <select
            id="page-size"
            value={pageSize}
            onChange={(event) => router.replace(hrefWith({ size: event.target.value, page: null }), { scroll: false })}
            className="!w-auto !min-w-0 !py-0 text-ui"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Halaman" className="flex items-center gap-1">
          {pageLink(1, "Halaman pertama", <CaretDoubleLeft aria-hidden="true" className="size-4" />)}
          {pageLink(page - 1, "Halaman sebelumnya", <CaretLeft aria-hidden="true" className="size-4" />)}
          <span className="px-2 tabular-nums">
            {page} / {pageCount}
          </span>
          {pageLink(page + 1, "Halaman berikutnya", <CaretRight aria-hidden="true" className="size-4" />)}
          {pageLink(pageCount, "Halaman terakhir", <CaretDoubleRight aria-hidden="true" className="size-4" />)}
        </nav>
      </div>
    </div>
  );
};

type ListFilterSelectProps = {
  id: string;
  param: string;
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
};

export const ListFilterSelect = ({ id, param, label, allLabel, options }: ListFilterSelectProps): React.ReactNode => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hrefWith = useHrefWith();
  return (
    <div className="!w-auto">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={searchParams.get(param) ?? ""}
        onChange={(event) => router.replace(hrefWith({ [param]: event.target.value || null, page: null }), { scroll: false })}
        className="!w-auto"
      >
        <option value="">{allLabel}</option>
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
};
