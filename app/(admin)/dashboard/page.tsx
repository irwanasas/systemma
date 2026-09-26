import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { markAllNotificationsRead } from "@/features/notifications/server/actions";
import { getDashboardCounts, listNotifications } from "@/features/notifications/server/queries";
import { notificationLabels } from "@/features/notifications/types";
import { requireRole } from "@/lib/auth/require-role";
import { formatDateTime } from "@/lib/dates";

const DashboardPage = async (): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  const [counts, notifications] = await Promise.all([getDashboardCounts(), listNotifications(user.id)]);
  const unreadCount = notifications.filter(({ isRead }) => !isRead).length;

  return (
    <main>
      <h1>Dasbor</h1>
      <section aria-labelledby="work-heading">
        <h2 id="work-heading">Perlu ditindaklanjuti</h2>
        <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/payments", label: "Bukti DP menunggu dicek", value: counts.pendingProofs },
            { href: "/orders?status=AWAITING_SETTLEMENT", label: "Menunggu pelunasan", value: counts.awaitingSettlement },
            { href: "/orders?status=IN_PRODUCTION", label: "Sedang diproduksi", value: counts.inProduction },
            { href: "/orders?status=AWAITING_DP", label: "Menunggu DP", value: counts.awaitingDp },
          ].map(({ href, label, value }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 text-foreground no-underline hover:border-primary"
              >
                <span className="text-3xl font-semibold tabular-nums">{value}</span>
                <span className="text-sm">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="notifications-heading">
        <h2 id="notifications-heading">Notifikasi ({unreadCount} belum dibaca)</h2>
        {notifications.length === 0 ? (
          <p>Belum ada notifikasi.</p>
        ) : (
          <>
            <ul className="flex list-none flex-col gap-2 p-0">
              {notifications.map(({ id, kind, orderId, orderNumber, agentName, agentCode, isRead, createdAt }) => (
                <li
                  key={id}
                  className={isRead ? "rounded-md border border-border bg-surface px-3 py-2" : "rounded-md border-2 border-primary bg-surface px-3 py-2"}
                >
                  <span className="block">
                    {!isRead && <strong>Baru · </strong>}
                    <span className="font-semibold">{notificationLabels[kind]}</span> · {agentName} ({agentCode})
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {orderId ? <Link href={`/orders/${orderId}`}>{orderNumber}</Link> : orderNumber} · {formatDateTime(createdAt)}
                  </span>
                </li>
              ))}
            </ul>
            {unreadCount > 0 && (
              <ActionForm action={markAllNotificationsRead} submitLabel="Tandai semua sudah dibaca" tone="secondary" pendingLabel="Menyimpan…" />
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
