import { cn } from "@/lib/utils";

export const TableCard = ({ children, className }: { children: React.ReactNode; className?: string }): React.ReactNode => (
  <div className={cn("max-h-[70vh] w-full overflow-auto rounded-lg border border-border bg-surface", className)}>{children}</div>
);
