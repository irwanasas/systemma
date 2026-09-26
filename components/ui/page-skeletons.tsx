import { Skeleton } from "@/components/ui/skeleton";

const LoadingMain = ({ children }: { children: React.ReactNode }): React.ReactNode => (
  <main aria-busy="true">
    <p role="status" className="sr-only">
      Memuat halaman…
    </p>
    {children}
  </main>
);

const TitleSkeleton = (): React.ReactNode => <Skeleton className="h-8 w-44" />;

export const TableSkeleton = ({ rows = 8, withFilters = true }: { rows?: number; withFilters?: boolean }): React.ReactNode => (
  <LoadingMain>
    <TitleSkeleton />
    {withFilters && (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-11 w-full sm:w-80" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>
    )}
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <Skeleton className="h-10 rounded-none" />
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 border-t border-border px-3 py-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </LoadingMain>
);

export const DashboardSkeleton = (): React.ReactNode => (
  <LoadingMain>
    <TitleSkeleton />
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  </LoadingMain>
);

export const CatalogSkeleton = (): React.ReactNode => (
  <LoadingMain>
    <div className="flex flex-col gap-2">
      <TitleSkeleton />
      <Skeleton className="h-5 w-72 max-w-full" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border bg-surface">
          <Skeleton className="h-24 rounded-none sm:h-28" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-48" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </LoadingMain>
);

export const CartSkeleton = (): React.ReactNode => (
  <LoadingMain>
    <TitleSkeleton />
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  </LoadingMain>
);
