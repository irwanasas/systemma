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
        <ul>
          <li>
            <Link href="/payments">Bukti DP menunggu dicek: {counts.pendingProofs}</Link>
          </li>
          <li>
            <Link href="/orders?status=AWAITING_SETTLEMENT">Menunggu pelunasan: {counts.awaitingSettlement}</Link>
          </li>
          <li>
            <Link href="/orders?status=IN_PRODUCTION">Sedang diproduksi: {counts.inProduction}</Link>
          </li>
          <li>
            <Link href="/orders?status=AWAITING_DP">Menunggu DP: {counts.awaitingDp}</Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="notifications-heading">
        <h2 id="notifications-heading">Notifikasi ({unreadCount} belum dibaca)</h2>
        {notifications.length === 0 ? (
          <p>Belum ada notifikasi.</p>
        ) : (
          <>
            <ul>
              {notifications.map(({ id, kind, orderId, orderNumber, agentName, agentCode, isRead, createdAt }) => (
                <li key={id}>
                  {!isRead && <strong>Baru: </strong>}
                  {notificationLabels[kind]} · {agentName} ({agentCode}) ·{" "}
                  {orderId ? <Link href={`/orders/${orderId}`}>{orderNumber}</Link> : orderNumber} · {formatDateTime(createdAt)}
                </li>
              ))}
            </ul>
            {unreadCount > 0 && (
              <ActionForm action={markAllNotificationsRead} submitLabel="Tandai semua sudah dibaca" pendingLabel="Menyimpan…" />
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
