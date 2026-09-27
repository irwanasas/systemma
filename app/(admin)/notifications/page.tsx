import Link from "next/link";
import { Bell, CheckCircle, Circle } from "@phosphor-icons/react/ssr";
import { ActionForm } from "@/components/ui/action-form";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { DateRangeFilter, ListPager } from "@/components/ui/list-controls";
import { notificationIcons } from "@/features/notifications/components/notification-icon";
import { parseNotificationFilter } from "@/features/notifications/filter";
import { markFilteredNotificationsRead, setNotificationRead } from "@/features/notifications/server/actions";
import { searchNotifications } from "@/features/notifications/server/queries";
import { NOTIFICATION_KINDS, notificationHref, notificationLabels } from "@/features/notifications/types";
import { jakartaToday, recapPresets } from "@/features/recap/period";
import { requireRole } from "@/lib/auth/require-role";
import { buildHref, pageRange, readPage, readPageSize, readParam } from "@/lib/list-params";
import { cn } from "@/lib/utils";

const NotificationsPage = async ({ searchParams }: PageProps<"/notifications">): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  const params = await searchParams;
  const filter = parseNotificationFilter({
    type: readParam(params.type),
    from: readParam(params.from),
    to: readParam(params.to),
    status: readParam(params.status),
  });
  const pageSize = readPageSize(readParam(params.size), 20);
  const requested = readPage(readParam(params.page));
  const first = await searchNotifications(user.id, filter, requested, pageSize);
  const page = Math.min(requested, pageRange(requested, pageSize, first.total).pageCount);
  const { items, total } = page === requested ? first : await searchNotifications(user.id, filter, page, pageSize);

  const current = {
    type: filter.kind ?? undefined,
    from: filter.from ?? undefined,
    to: filter.to ?? undefined,
    status: filter.unreadOnly ? "unread" : undefined,
    size: pageSize === 20 ? undefined : String(pageSize),
  };
  const hrefWith = (updates: Partial<typeof current>): string => buildHref("/notifications", { ...current, ...updates });
  const typeChips = [
    { label: "Semua jenis", href: hrefWith({ type: undefined }), active: filter.kind === null },
    ...NOTIFICATION_KINDS.map((kind) => ({ label: notificationLabels[kind], href: hrefWith({ type: kind }), active: filter.kind === kind })),
  ];
  const statusChips = [
    { label: "Semua", href: hrefWith({ status: undefined }), active: !filter.unreadOnly },
    { label: "Belum dibaca", href: hrefWith({ status: "unread" }), active: filter.unreadOnly },
  ];
  const presets = recapPresets(jakartaToday());
  const dateChips = [
    { label: "Semua waktu", href: hrefWith({ from: undefined, to: undefined }), active: !filter.from && !filter.to },
    ...presets.map(({ label, from, to }) => ({
      label,
      href: hrefWith({ from, to }),
      active: filter.from === from && filter.to === to,
    })),
  ];
  const hasFilter = Boolean(filter.kind || filter.from || filter.to || filter.unreadOnly);

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Notifikasi</h1>
        <ActionForm
          action={markFilteredNotificationsRead}
          submitLabel={hasFilter ? "Tandai semua dibaca (filter ini)" : "Tandai semua dibaca"}
          pendingLabel="Menyimpan…"
          tone="secondary"
          className="!items-end"
        >
          <input type="hidden" name="type" value={filter.kind ?? ""} />
          <input type="hidden" name="from" value={filter.from ?? ""} />
          <input type="hidden" name="to" value={filter.to ?? ""} />
        </ActionForm>
      </div>

      <div className="flex flex-col gap-3">
        <FilterChips label="Jenis notifikasi" chips={typeChips} />
        <FilterChips label="Status baca" chips={statusChips} />
        <FilterChips label="Periode" chips={dateChips} />
        <DateRangeFilter from={filter.from} to={filter.to} />
      </div>

      {total === 0 ? (
        hasFilter ? (
          <EmptyState icon={Bell} title="Tidak ada notifikasi yang cocok" description="Ubah jenis, periode atau status untuk melihat notifikasi lain." />
        ) : (
          <EmptyState icon={Bell} title="Belum ada notifikasi" description="Pesanan baru, bukti DP dan pembatalan akan muncul di sini." />
        )
      ) : (
        <>
          <ul aria-label="Daftar notifikasi" className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
            {items.map((notification) => {
              const KindIcon = notificationIcons[notification.kind];
              return (
                <li key={notification.id} className={cn("flex items-start gap-3 px-4 py-3", !notification.isRead && "bg-primary-soft/40")}>
                  <span className="relative mt-0.5 shrink-0">
                    <KindIcon aria-hidden="true" className="size-5 text-muted-foreground" />
                    {!notification.isRead && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="flex min-w-0 flex-auto flex-col gap-0.5">
                    <span className="text-ui">
                      <span className={cn(!notification.isRead && "font-semibold")}>{notificationLabels[notification.kind]}</span>
                      {!notification.isRead && <span className="sr-only"> (belum dibaca)</span>} · {notification.agentName} ({notification.agentCode})
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                      {notification.orderNumber && (
                        <Link href={notificationHref(notification)} className="font-medium">
                          {notification.orderNumber}
                        </Link>
                      )}
                      <DateTime value={notification.createdAt} />
                    </span>
                  </span>
                  <ActionForm
                    action={setNotificationRead}
                    submitLabel={
                      notification.isRead
                        ? `Tandai belum dibaca ${notification.orderNumber ?? ""}`.trim()
                        : `Tandai dibaca ${notification.orderNumber ?? ""}`.trim()
                    }
                    shortLabel={notification.isRead ? "Belum dibaca" : "Dibaca"}
                    icon={notification.isRead ? <Circle aria-hidden="true" /> : <CheckCircle aria-hidden="true" />}
                    tone="ghost"
                    pendingLabel="Menyimpan…"
                    buttonClassName="min-h-9 shrink-0 px-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <input type="hidden" name="id" value={notification.id} />
                    <input type="hidden" name="read" value={notification.isRead ? "0" : "1"} />
                  </ActionForm>
                </li>
              );
            })}
          </ul>
          <ListPager total={total} page={page} pageSize={pageSize} />
        </>
      )}
    </main>
  );
};

export default NotificationsPage;
