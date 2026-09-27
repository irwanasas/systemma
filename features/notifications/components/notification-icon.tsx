import type { Icon } from "@phosphor-icons/react";
import { Receipt, ShoppingCartSimple, XCircle } from "@phosphor-icons/react/ssr";
import type { NotificationKind } from "@/features/notifications/types";

export const notificationIcons: Record<NotificationKind, Icon> = {
  ORDER_PLACED: ShoppingCartSimple,
  PAYMENT_SUBMITTED: Receipt,
  ORDER_CANCELLED: XCircle,
};
