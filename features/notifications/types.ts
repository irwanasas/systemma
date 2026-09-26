export type NotificationKind = "ORDER_PLACED" | "ORDER_CANCELLED" | "PAYMENT_SUBMITTED";

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
