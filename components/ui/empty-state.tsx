import type { Icon } from "@phosphor-icons/react";

type EmptyStateProps = {
  icon: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const EmptyState = ({ icon: IconComponent, title, description, action }: EmptyStateProps): React.ReactNode => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-10 text-center">
    <IconComponent aria-hidden="true" className="size-10 text-muted-foreground" />
    <p className="text-base font-semibold">{title}</p>
    {description && <p className="max-w-md text-ui text-muted-foreground">{description}</p>}
    {action}
  </div>
);
