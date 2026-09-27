export const NOTIFICATION_KINDS = ["ORDER_PLACED", "PAYMENT_SUBMITTED", "ORDER_CANCELLED"] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type Notification = {
  id: string;
  kind: NotificationKind;
  orderId: string | null;
  orderNumber: string | null;
  agentName: string | null;
  agentCode: string | null;
  isRead: boolean;
  createdAt: string;
};

export const notificationLabels: Record<NotificationKind, string> = {
  ORDER_PLACED: "Pesanan baru",
  ORDER_CANCELLED: "Pesanan dibatalkan",
  PAYMENT_SUBMITTED: "Bukti DP dikirim",
};

export const notificationHref = ({ kind, orderId }: Pick<Notification, "kind" | "orderId">): string => {
  if (!orderId) return "/notifications";
  return kind === "PAYMENT_SUBMITTED" ? "/payments" : `/orders/${orderId}`;
};

export type NotificationFilter = {
  kind: NotificationKind | null;
  from: string | null;
  to: string | null;
  unreadOnly: boolean;
};
