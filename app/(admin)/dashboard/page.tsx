import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  Bell,
  CalendarX,
  CaretRight,
  CheckCircle,
  Clock,
  Factory,
  Megaphone,
  Plus,
  Receipt,
  ShoppingCartSimple,
  Timer,
  Wallet,
  XCircle,
} from "@phosphor-icons/react/ssr";
import { ChartCard } from "@/components/charts/chart-card";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/ui/action-form";
import { DateTime } from "@/components/ui/date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { CreateAgentForm } from "@/features/auth/components/create-agent-form";
import { firstWeekStart, weeklyValues } from "@/features/dashboard/buckets";
import { getAttentionCounts, listOrderValues } from "@/features/dashboard/server/queries";
import { CreateBatchDialog } from "@/features/po-batches/components/create-batch-dialog";
import { listProductOptions } from "@/features/po-batches/server/queries";
import { jakartaToday, parseRecapPeriod } from "@/features/recap/period";
import { getRecapRows } from "@/features/recap/server/queries";
import { RECAP_CATEGORIES, summarizeRecap } from "@/features/recap/summarize";
import { getSettings } from "@/features/settings/server/queries";
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

const DAY_MS = 24 * 60 * 60 * 1000;

const DashboardPage = async (): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  const now = new Date();
  const today = jakartaToday();
  const endOfToday = new Date(new Date(`${today}T00:00:00+07:00`).getTime() + DAY_MS).toISOString();
  const weekStart = new Date(`${firstWeekStart(today, 8)}T00:00:00+07:00`).toISOString();
  const [counts, attention, notifications, orderValues, recapRows, products, settings] = await Promise.all([
    getDashboardCounts(),
    getAttentionCounts(now, endOfToday),
    listNotifications(user.id),
    listOrderValues(weekStart, endOfToday),
    getRecapRows(parseRecapPeriod(undefined, undefined)),
    listProductOptions(),
    getSettings(),
  ]);
  const unreadCount = notifications.filter(({ isRead }) => !isRead).length;
  const qtyByCategory = summarizeRecap(recapRows).qtyByCategory;
  const tiles: { href: string; label: string; value: number; icon: Icon; urgent: boolean }[] = [
    {
      href: "/payments",
      label: "Bukti DP menunggu",
      value: counts.pendingProofs,
      icon: Receipt,
      urgent: counts.pendingProofs > 0,
    },
    {
      href: "/orders?status=AWAITING_SETTLEMENT",
      label: "Menunggu pelunasan",
      value: counts.awaitingSettlement,
      icon: Wallet,
      urgent: false,
    },
    {
      href: "/orders?status=IN_PRODUCTION",
      label: "Sedang diproduksi",
      value: counts.inProduction,
      icon: Factory,
      urgent: false,
    },
    { href: "/orders?status=AWAITING_DP", label: "Menunggu DP", value: counts.awaitingDp, icon: Clock, urgent: false },
  ];
  const attentionRows = [
    { href: "/payments", icon: Receipt, count: counts.pendingProofs, text: "bukti DP menunggu dicek" },
    {
      href: "/orders?status=AWAITING_SETTLEMENT",
      icon: Wallet,
      count: counts.awaitingSettlement,
      text: "pesanan menunggu pelunasan",
    },
    { href: "/po-batches", icon: CalendarX, count: attention.batchesClosingSoon, text: "batch PO tutup dalam 3 hari" },
    {
      href: "/orders?status=AWAITING_DP",
      icon: Timer,
      count: attention.dpDueToday,
      text: "batas bayar DP berakhir hari ini",
    },
  ].filter(({ count }) => count > 0);

  return (
    <main>
      <h1>Dasbor</h1>
      <section aria-labelledby="work-heading">
        <h2 id="work-heading" className="sr-only">
          Ringkasan pesanan
        </h2>
        <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {tiles.map(({ href, label, value, icon: TileIcon, urgent }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex h-full items-start justify-between gap-2 rounded-xl border border-t-[3px] border-t-ochre bg-surface p-3 text-foreground no-underline transition-colors duration-150 hover:border-border-strong hover:border-t-ochre hover:no-underline sm:p-4",
                  urgent ? "border-warning/40 bg-warning-soft" : "border-border",
                )}
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-2xl leading-none font-semibold tabular-nums sm:text-3xl">{value}</span>
                  <span className="text-sm text-muted-foreground sm:text-ui">{label}</span>
                </span>
                <TileIcon
                  aria-hidden="true"
                  className={cn("size-5 shrink-0 sm:size-6", urgent ? "text-warning" : "text-muted-foreground")}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <SectionCard id="attention-heading" title="Perlu perhatian">
          {attentionRows.length === 0 ? (
            <p className="flex items-center gap-3 rounded-lg bg-success-soft px-4 py-3 text-ui">
              <CheckCircle aria-hidden="true" weight="fill" className="size-5 shrink-0 text-success" />
              <span>
                <span className="font-semibold">Semua beres.</span> Tidak ada yang perlu ditindaklanjuti sekarang.
              </span>
            </p>
          ) : (
            <ul className="-mx-4 divide-y divide-border sm:-mx-5">
              {attentionRows.map(({ href, icon: RowIcon, count, text }) => (
                <li key={href + text}>
                  <Link
                    href={href}
                    className="flex min-h-12 items-center gap-3 px-4 py-2 text-ui text-foreground no-underline transition-colors duration-150 hover:bg-muted hover:no-underline sm:px-5"
                  >
                    <RowIcon aria-hidden="true" className="size-5 shrink-0 text-primary-strong" />
                    <span className="flex-auto">
                      <span className="font-semibold tabular-nums">{count}</span> {text}
                    </span>
                    <CaretRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard id="quick-actions-heading" title="Aksi cepat">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 [&_button]:w-full [&_a]:w-full">
            <Button asChild variant="outline" className="min-h-[var(--control-height)] text-ui">
              <Link href="/products/new" className="text-foreground no-underline hover:no-underline">
                <Plus aria-hidden="true" />
                Tambah produk
              </Link>
            </Button>
            <CreateBatchDialog
              products={products}
              etaDaysDefault={settings.eta_days_default}
              triggerVariant="outline"
              triggerLabel="Buat batch"
            />
            <CreateAgentForm triggerVariant="outline" />
            <Button asChild variant="outline" className="min-h-[var(--control-height)] text-ui">
              <Link href="/announcements" className="text-foreground no-underline hover:no-underline">
                <Megaphone aria-hidden="true" />
                Tulis pengumuman
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          id="weekly-chart-heading"
          title="Nilai pesanan per minggu"
          description="8 minggu terakhir, tanpa pesanan dibatalkan dan kedaluwarsa."
          kind="line"
          unit="rupiah"
          data={weeklyValues(orderValues, today, 8)}
        />
        <ChartCard
          id="category-chart-heading"
          title="Pcs per kategori"
          description="Bulan ini."
          kind="bar"
          unit="pcs"
          data={RECAP_CATEGORIES.map(({ code, name }) => ({ label: name, value: qtyByCategory[code] ?? 0 }))}
        />
      </div>

      <SectionCard
        id="notifications-heading"
        title={
          <span className="flex items-center gap-2">
            Notifikasi
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-sans text-xs font-semibold tracking-normal text-primary-foreground tabular-nums">
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
          <EmptyState
            icon={Bell}
            title="Belum ada notifikasi"
            description="Pesanan baru dan bukti DP akan muncul di sini."
          />
        ) : (
          <ul className="-mx-4 divide-y divide-border sm:-mx-5">
            {notifications.map(({ id, kind, orderId, orderNumber, agentName, agentCode, isRead, createdAt }) => {
              const KindIcon = kindIcons[kind];
              return (
                <li
                  key={id}
                  className={cn("flex items-start gap-3 px-4 py-3 sm:px-5", !isRead && "bg-primary-soft/40")}
                >
                  <span className="relative mt-0.5 shrink-0">
                    <KindIcon aria-hidden="true" className="size-5 text-muted-foreground" />
                    {!isRead && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary"
                      />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-auto flex-col gap-0.5">
                    <span className="text-ui">
                      {!isRead && <span className="sr-only">Baru · </span>}
                      <span className={cn(!isRead && "font-semibold")}>{notificationLabels[kind]}</span> · {agentName} (
                      {agentCode})
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
