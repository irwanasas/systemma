import Link from "next/link";
import { logout } from "@/features/auth/server/actions";

type NavLink = {
  href: string;
  label: string;
};

type AppHeaderProps = {
  fullName: string;
  links: NavLink[];
};

export const AppHeader = ({ fullName, links }: AppHeaderProps): React.ReactNode => (
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
    <p>{fullName}</p>
    <form action={logout}>
      <button type="submit">Keluar</button>
    </form>
  </header>
);
