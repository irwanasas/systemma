import { CalendarBlank, LockSimple, LockSimpleOpen } from "@phosphor-icons/react/ssr";
import { StatusBadge } from "@/components/ui/status-badge";
import { batchStatusLabels, type BatchStatus } from "@/features/catalog/types";

export const batchStatusAppearance = {
  scheduled: { tone: "info", icon: CalendarBlank },
  open: { tone: "success", icon: LockSimpleOpen },
  closed: { tone: "neutral", icon: LockSimple },
} as const;

export const BatchStatusBadge = ({ status }: { status: BatchStatus }): React.ReactNode => (
  <StatusBadge {...batchStatusAppearance[status]} label={batchStatusLabels[status]} />
);
