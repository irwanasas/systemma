import Link from "next/link";
import { Bell, SignOut } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/layout/nav-menu";
import type { NavLink } from "@/components/layout/nav-links";
import { logout } from "@/features/auth/server/actions";

type AppHeaderProps = {
  fullName: string;
  links: NavLink[];
  unreadCount?: number;
};

export const AppHeader = ({ fullName, links, unreadCount = 0 }: AppHeaderProps): React.ReactNode => (
  <header className="border-b border-border bg-surface">
    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground no-underline">
          Aurora
        </Link>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Link href="/dashboard" className="flex items-center gap-1 text-sm font-medium">
              <Bell aria-hidden="true" />
              {unreadCount} notifikasi baru
            </Link>
          )}
          <span className="hidden text-sm text-muted-foreground sm:inline">{fullName}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" className="min-h-[var(--control-height)]">
              <SignOut aria-hidden="true" />
              Keluar
            </Button>
          </form>
        </div>
      </div>
      <NavMenu links={links} />
    </div>
  </header>
);
