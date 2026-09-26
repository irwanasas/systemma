import { BackLink } from "@/components/ui/back-link";
import { MetaList, type MetaItem } from "@/components/ui/meta-list";

export const OrderHeader = ({
  number,
  meta,
}: {
  number: string;
  meta: MetaItem[];
}): React.ReactNode => (
  <>
    <BackLink href="/orders" label="Kembali ke daftar pesanan" />
    <h1 className="flex flex-col gap-1">
      <span className="text-sm font-medium tracking-normal text-muted-foreground">
        Pesanan
      </span>
      <span>{number}</span>
    </h1>
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <MetaList items={meta} />
    </div>
  </>
);
