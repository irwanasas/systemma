import Link from "next/link";
import { Bell } from "@phosphor-icons/react/ssr";
import { CountBadge } from "@/components/layout/count-badge";

export const NotificationBell = ({ unreadCount }: { unreadCount: number }): React.ReactNode => (
  <Link
    href="/dashboard"
    aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
    className="relative inline-flex size-10 items-center justify-center rounded-md text-foreground no-underline hover:bg-muted"
  >
    <Bell aria-hidden="true" className="size-5" />
    <CountBadge count={unreadCount} className="absolute -top-0.5 -right-0.5" />
  </Link>
);
