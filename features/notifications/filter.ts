import { NOTIFICATION_KINDS, type NotificationFilter, type NotificationKind } from "@/features/notifications/types";
import { isValidDate } from "@/features/recap/period";

type RawFilter = { type?: string; from?: string; to?: string; status?: string };

export const parseNotificationFilter = ({ type, from, to, status }: RawFilter): NotificationFilter => {
  const validFrom = isValidDate(from) ? from : null;
  const validTo = isValidDate(to) ? to : null;
  const ordered = validFrom && validTo && validFrom > validTo ? [validTo, validFrom] : [validFrom, validTo];
  return {
    kind: NOTIFICATION_KINDS.find((kind) => kind === type) ?? (null as NotificationKind | null),
    from: ordered[0],
    to: ordered[1],
    unreadOnly: status === "unread",
  };
};
