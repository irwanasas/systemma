import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import { Bell, Clock, Factory, Receipt, ShoppingCartSimple, Wallet, XCircle } from "@phosphor-icons/react/ssr";
import { ActionForm } from "@/components/ui/action-form";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { markAllNotificationsRead } from "@/features/notifications/server/actions";
import { getDashboardCounts, listNotifications } from "@/features/notifications/server/queries";
import { notificationLabels, type NotificationKind } from "@/features/notifications/types";
import { requireRole } from "@/lib/auth/require-role";
import { cn } from "@/lib/utils";

const kindIcons: Record<NotificationKind, Icon> = {
  ORDER_PLACED: ShoppingCartSimple,
  ORDER_CANCELLED: XCircle,
  PAYMENT_SUBMITTED: Receipt,
};

const DashboardPage = async (): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  const [counts, notifications] = await Promise.all([getDashboardCounts(), listNotifications(user.id)]);
  const unreadCount = notifications.filter(({ isRead }) => !isRead).length;
  const tiles: { href: string; label: string; value: number; icon: Icon; urgent: boolean }[] = [
    { href: "/payments", label: "Bukti DP menunggu dicek", value: counts.pendingProofs, icon: Receipt, urgent: counts.pendingProofs > 0 },
    {
      href: "/orders?status=AWAITING_SETTLEMENT",
      label: "Menunggu pelunasan",
      value: counts.awaitingSettlement,
      icon: Wallet,
      urgent: false,
    },
    { href: "/orders?status=IN_PRODUCTION", label: "Sedang diproduksi", value: counts.inProduction, icon: Factory, urgent: false },
    { href: "/orders?status=AWAITING_DP", label: "Menunggu DP", value: counts.awaitingDp, icon: Clock, urgent: false },
  ];

  return (
    <main>
      <h1>Dasbor</h1>
      <section aria-labelledby="work-heading">
        <h2 id="work-heading">Perlu ditindaklanjuti</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map(({ href, label, value, icon: TileIcon, urgent }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-xl border bg-surface p-4 text-foreground no-underline transition-colors duration-150 hover:border-border-strong hover:no-underline",
                  urgent ? "border-warning/40 bg-warning-soft" : "border-border",
                )}
              >
                <span className="flex flex-col gap-1">
                  <span className="text-3xl leading-none font-semibold tabular-nums">{value}</span>
                  <span className="text-ui text-muted-foreground">{label}</span>
                </span>
                <TileIcon aria-hidden="true" className={cn("size-6 shrink-0", urgent ? "text-warning" : "text-muted-foreground")} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <SectionCard
        id="notifications-heading"
        title={
          <span className="flex items-center gap-2">
            Notifikasi
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
                {unreadCount} belum dibaca
              </span>
            )}
          </span>
        }
        action={
          unreadCount > 0 && (
            <ActionForm
              action={markAllNotificationsRead}
              submitLabel="Tandai semua sudah dibaca"
              tone="ghost"
              pendingLabel="Menyimpan…"
              buttonClassName="min-h-9 px-3"
            />
          )
        }
      >
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="Belum ada notifikasi" description="Pesanan baru dan bukti DP akan muncul di sini." />
        ) : (
          <ul className="-mx-4 divide-y divide-border sm:-mx-5">
            {notifications.map(({ id, kind, orderId, orderNumber, agentName, agentCode, isRead, createdAt }) => {
              const KindIcon = kindIcons[kind];
              return (
                <li key={id} className={cn("flex items-start gap-3 px-4 py-3 sm:px-5", !isRead && "bg-primary-soft/40")}>
                  <span className="relative mt-0.5 shrink-0">
                    <KindIcon aria-hidden="true" className="size-5 text-muted-foreground" />
                    {!isRead && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="flex min-w-0 flex-auto flex-col gap-0.5">
                    <span className="text-ui">
                      {!isRead && <span className="sr-only">Baru · </span>}
                      <span className={cn(!isRead && "font-semibold")}>{notificationLabels[kind]}</span> · {agentName} ({agentCode})
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {orderId ? (
                        <Link href={`/orders/${orderId}`} className="font-medium">
                          {orderNumber}
                        </Link>
                      ) : (
                        orderNumber
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    <DateTime value={createdAt} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </main>
  );
};

export default DashboardPage;
