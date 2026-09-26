import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

type SearchFieldProps = {
  label: string;
  placeholder: string;
  defaultValue?: string;
  hidden?: Record<string, string | undefined>;
  children?: React.ReactNode;
};

export const SearchField = ({ label, placeholder, defaultValue, hidden = {}, children }: SearchFieldProps): React.ReactNode => (
  <form method="get" role="search" className="!flex-row !flex-wrap !items-end !gap-2">
    {Object.entries(hidden).map(([name, value]) => value && <input key={name} type="hidden" name={name} value={value} />)}
    <div className="relative min-w-0 flex-1 sm:!w-80 sm:flex-none">
      <label htmlFor="q" className="sr-only">
        {label}
      </label>
      <MagnifyingGlass aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input id="q" name="q" type="search" defaultValue={defaultValue} placeholder={placeholder} className="!max-w-none pl-9" />
    </div>
    {children}
    <Button type="submit" variant="outline" className="min-h-[var(--control-height)] text-ui">
      Cari
    </Button>
  </form>
);
