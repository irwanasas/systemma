import Link from "next/link";
import { logout } from "@/features/auth/server/actions";
import type { NavLink } from "@/components/layout/nav-links";

type AppHeaderProps = {
  fullName: string;
  links: NavLink[];
  unreadCount?: number;
};

export const AppHeader = ({ fullName, links, unreadCount = 0 }: AppHeaderProps): React.ReactNode => (
  <header>
    <nav aria-label="Navigasi utama">
      <ul>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
    {unreadCount > 0 && (
      <p>
        <Link href="/dashboard">{unreadCount} notifikasi baru</Link>
      </p>
    )}
    <p>{fullName}</p>
    <form action={logout}>
      <button type="submit">Keluar</button>
    </form>
  </header>
);
