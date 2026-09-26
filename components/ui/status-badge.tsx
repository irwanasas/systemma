import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-foreground",
  info: "border-info/30 bg-info-soft text-info",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-danger/30 bg-danger-soft text-danger",
};

type StatusBadgeProps = {
  tone: BadgeTone;
  icon: Icon;
  label: string;
};

export const StatusBadge = ({ tone, icon: IconComponent, label }: StatusBadgeProps): React.ReactNode => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap",
      toneClasses[tone],
    )}
  >
    <IconComponent aria-hidden="true" weight="bold" />
    {label}
  </span>
);
