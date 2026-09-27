"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bell, BellSlash } from "@phosphor-icons/react";
import { Popover } from "radix-ui";
import { CountBadge } from "@/components/layout/count-badge";
import { Button } from "@/components/ui/button";
import { notificationIcons } from "@/features/notifications/components/notification-icon";
import { markAllNotificationsRead, markNotificationRead } from "@/features/notifications/server/actions";
import { notificationHref, notificationLabels, type Notification } from "@/features/notifications/types";
import { formatDateTime, formatRelativeTime } from "@/lib/dates";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  unreadCount: number;
  notifications: Notification[];
};

export const NotificationBell = ({ unreadCount, notifications }: NotificationBellProps): React.ReactNode => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openNotification = (notification: Notification): void => {
    startTransition(async () => {
      if (!notification.isRead) await markNotificationRead(notification.id);
      setOpen(false);
      router.push(notificationHref(notification));
    });
  };

  const markAll = (): void => {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
          className="relative size-10 text-foreground"
        >
          <Bell aria-hidden="true" className="size-5" />
          <CountBadge count={unreadCount} className="absolute -top-0.5 -right-0.5" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={8}
          aria-labelledby="notification-panel-heading"
          className="z-50 flex max-h-[min(36rem,calc(100dvh-5rem))] w-[min(24rem,calc(100vw-16px))] flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 id="notification-panel-heading" className="font-sans text-base tracking-normal">
                Notifikasi
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-primary-strong tabular-nums">
                  {unreadCount} belum dibaca
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0 || isPending}
              onClick={markAll}
              className="min-h-9 px-2 text-sm text-primary-strong"
            >
              Tandai semua dibaca
            </Button>
          </div>
          {notifications.length === 0 ? (
            <p className="flex flex-col items-center gap-2 px-4 py-10 text-center text-ui text-muted-foreground">
              <BellSlash aria-hidden="true" className="size-8" />
              Belum ada notifikasi
            </p>
          ) : (
            <ul aria-busy={isPending} className="min-h-0 flex-auto divide-y divide-border overflow-y-auto">
              {notifications.map((notification) => {
                const KindIcon = notificationIcons[notification.kind];
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      data-slot="notification-item"
                      onClick={() => openNotification(notification)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-muted focus-visible:bg-muted",
                        !notification.isRead && "bg-primary-soft/40",
                      )}
                    >
                      <KindIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                      <span className="flex min-w-0 flex-auto flex-col gap-0.5">
                        <span className={cn("text-ui", !notification.isRead && "font-semibold")}>
                          {notificationLabels[notification.kind]}
                          {!notification.isRead && <span className="sr-only"> (belum dibaca)</span>}
                        </span>
                        <span className="truncate text-sm text-muted-foreground">
                          {notification.agentName} ({notification.agentCode}) · {notification.orderNumber}
                        </span>
                        <time dateTime={notification.createdAt} title={formatDateTime(notification.createdAt)} className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </time>
                      </span>
                      {!notification.isRead && <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="border-t border-border p-2">
            <Button asChild variant="ghost" className="min-h-10 w-full text-ui text-primary-strong">
              <Link href="/notifications" onClick={() => setOpen(false)} className="no-underline hover:no-underline">
                Lihat semua
              </Link>
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
