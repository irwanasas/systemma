import { cn } from "@/lib/utils";

export const ColorSwatch = ({ hex, className }: { hex: string | null; className?: string }): React.ReactNode => (
  <span
    aria-hidden="true"
    className={cn("inline-block size-4 shrink-0 rounded-full border border-foreground/25 bg-muted", className)}
    style={hex ? { backgroundColor: hex } : undefined}
  />
);
