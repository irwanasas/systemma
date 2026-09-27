import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { adminNavIcons } from "@/components/layout/nav-icons";
import { NotificationBell } from "@/components/layout/notification-bell";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { CurrentUser } from "@/features/auth/types";
import { countUnreadNotifications, listNotifications } from "@/features/notifications/server/queries";

export const AdminShell = async ({ user, children }: { user: CurrentUser; children: React.ReactNode }): Promise<React.ReactNode> => {
  const [unreadCount, notifications] = await Promise.all([countUnreadNotifications(user.id), listNotifications(user.id, 10)]);
  return (
    <div data-density="compact" className="text-ui">
      <SidebarProvider>
        <AdminSidebar icons={adminNavIcons()} />
        <SidebarInset className="min-h-dvh bg-background">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface px-4 lg:px-8">
            <SidebarTrigger className="size-10 lg:hidden" />
            <Link href="/dashboard" className="text-foreground no-underline hover:no-underline lg:hidden">
              <BrandMark size="sm" />
            </Link>
            <span className="hidden rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-foreground sm:inline-block">
              Admin
            </span>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle className="size-10" />
              <NotificationBell unreadCount={unreadCount} notifications={notifications} />
              <AccountMenu fullName={user.fullName} roleLabel="Admin" />
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
