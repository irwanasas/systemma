import { cn } from "@/lib/utils";

type SectionCardProps = {
  id: string;
  title: React.ReactNode;
  action?: React.ReactNode;
  emphasis?: boolean;
  className?: string;
  children: React.ReactNode;
};

export const SectionCard = ({ id, title, action, emphasis = false, className, children }: SectionCardProps): React.ReactNode => (
  <section
    aria-labelledby={id}
    className={cn(
      "flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5",
      emphasis && "border-2 border-primary",
      className,
    )}
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id={id}>{title}</h2>
      {action}
    </div>
    {children}
  </section>
);
