"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

export const NavMenu = ({ links }: { links: NavLink[] }): React.ReactNode => {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex list-none gap-1 p-0 whitespace-nowrap">
        {links.map(({ href, label }) => {
          const isCurrent = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex min-h-[var(--control-height)] items-center rounded-md px-3 text-sm text-foreground no-underline transition-colors duration-150 hover:bg-muted",
                  isCurrent && "bg-primary-soft font-semibold text-primary-strong",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
