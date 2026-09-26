import {
  CheckCircle,
  Clock,
  HourglassLow,
  MagnifyingGlass,
  Package,
  Scissors,
  SealCheck,
  Truck,
  Wallet,
  XCircle,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { orderStatusLabels, type OrderStatus } from "@/features/orders/types";

const statusAppearance: Record<OrderStatus, { tone: BadgeTone; icon: Icon }> = {
  AWAITING_DP: { tone: "warning", icon: Clock },
  DP_UNDER_REVIEW: { tone: "info", icon: MagnifyingGlass },
  DP_RECEIVED: { tone: "success", icon: CheckCircle },
  IN_PRODUCTION: { tone: "info", icon: Scissors },
  AWAITING_SETTLEMENT: { tone: "warning", icon: Wallet },
  SETTLED: { tone: "success", icon: SealCheck },
  SHIPPED: { tone: "info", icon: Truck },
  COMPLETED: { tone: "success", icon: Package },
  CANCELLED: { tone: "neutral", icon: XCircle },
  EXPIRED: { tone: "danger", icon: HourglassLow },
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }): React.ReactNode => (
  <StatusBadge {...statusAppearance[status]} label={orderStatusLabels[status]} />
);
