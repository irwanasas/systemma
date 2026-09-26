import type { Icon } from "@phosphor-icons/react";

type StatusPageProps = {
  icon: Icon;
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
};

export const StatusPage = ({ icon: IconComponent, title, children, action }: StatusPageProps): React.ReactNode => (
  <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
    <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
      <IconComponent aria-hidden="true" className="size-7 text-primary-strong" />
    </span>
    <h1>{title}</h1>
    <div className="flex flex-col items-center gap-2 text-muted-foreground">{children}</div>
    {action}
  </main>
);
