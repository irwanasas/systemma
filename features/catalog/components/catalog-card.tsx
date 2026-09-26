import Link from "next/link";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react/ssr";
import { ColorSwatch } from "@/features/catalog/components/color-swatch";
import type { CatalogListItem } from "@/features/catalog/server/queries";
import { formatDateTime, formatShortDateTime } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

const MAX_SWATCHES = 6;

export const CatalogCard = ({ product }: { product: CatalogListItem }): React.ReactNode => {
  const { slug, name, categoryName, batchLabel, closesAt, minPrice, maxPrice, colors } = product;
  const shownColors = colors.slice(0, MAX_SWATCHES);
  const hiddenColorCount = colors.length - shownColors.length;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-strong focus-within:ring-[3px] focus-within:ring-ring/50">
      <div aria-hidden="true" className="relative flex h-24 items-end sm:h-28 justify-between bg-primary-soft px-4 pb-3">
        <span className="absolute top-2 right-4 text-5xl leading-none font-semibold text-primary/25 select-none">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="flex items-center gap-1.5">
          {shownColors.map(({ name: colorName, hex }) => (
            <ColorSwatch key={colorName} hex={hex} className="size-5" />
          ))}
          {hiddenColorCount > 0 && <span className="text-sm font-medium text-primary-strong">+{hiddenColorCount}</span>}
        </span>
      </div>
      <div className="flex flex-auto flex-col gap-2 p-4">
        <p className="text-sm font-medium text-muted-foreground">
          {categoryName} · PO {batchLabel}
        </p>
        <h2 className="text-lg">
          <Link href={`/catalog/${slug}`} className="text-foreground outline-none after:absolute after:inset-0 hover:no-underline">
            {name}
          </Link>
        </h2>
        {minPrice !== null && maxPrice !== null && (
          <p className="text-base font-semibold tabular-nums">
            {minPrice === maxPrice ? formatRupiah(minPrice) : `${formatRupiah(minPrice)} – ${formatRupiah(maxPrice)}`}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {closesAt ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarBlank aria-hidden="true" className="size-4" />
              <span>
                Ditutup{" "}
                <time dateTime={closesAt} title={formatDateTime(closesAt)}>
                  {formatShortDateTime(closesAt)}
                </time>
              </span>
            </p>
          ) : (
            <span />
          )}
          <span
            aria-hidden="true"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-ui font-medium text-primary-foreground transition-colors group-hover:bg-primary-strong"
          >
            Pesan
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
};
