import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AgentBottomNav, AgentTopNav } from "@/components/layout/agent-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { CurrentUser } from "@/features/auth/types";
import { getCartItemCount } from "@/features/cart/server/queries";
import { countUnreadNotifications } from "@/features/notifications/server/queries";

const AdminShell = async ({ user, children }: { user: CurrentUser; children: React.ReactNode }): Promise<React.ReactNode> => {
  const unreadCount = await countUnreadNotifications(user.id);
  return (
    <div data-density="compact" className="text-ui">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="min-h-dvh bg-background">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface px-4 lg:px-8">
            <SidebarTrigger className="size-10 lg:hidden" />
            <Link href="/dashboard" className="font-semibold text-foreground no-underline lg:hidden">
              Aurora
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <NotificationBell unreadCount={unreadCount} />
              <AccountMenu fullName={user.fullName} roleLabel="Admin" />
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

const AgentShell = async ({ user, children }: { user: CurrentUser; children: React.ReactNode }): Promise<React.ReactNode> => {
  const cartCount = await getCartItemCount(user.id);
  return (
    <div data-density="comfortable" className="min-h-dvh pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link href="/catalog" className="text-lg font-semibold tracking-tight text-foreground no-underline">
            Aurora
          </Link>
          <AgentTopNav cartCount={cartCount} />
          <div className="ml-auto">
            <AccountMenu fullName={user.fullName} roleLabel="Agen" />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
      <AgentBottomNav cartCount={cartCount} />
    </div>
  );
};

export const RoleShell = ({ user, children }: { user: CurrentUser; children: React.ReactNode }): React.ReactNode =>
  user.role === "admin" ? <AdminShell user={user}>{children}</AdminShell> : <AgentShell user={user}>{children}</AgentShell>;
