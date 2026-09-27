"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CountBadge } from "@/components/layout/count-badge";
import { agentNavItems, isActivePath } from "@/components/layout/nav-config";
import type { NavIcons } from "@/components/layout/nav-icons";
import { cn } from "@/lib/utils";

export const AgentTopNav = ({ cartCount }: { cartCount: number }): React.ReactNode => {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="hidden md:block">
      <ul className="flex list-none gap-1 p-0">
        {agentNavItems.map(({ href, label }) => {
          const isActive = isActivePath(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                aria-label={href === "/cart" && cartCount > 0 ? `${label}, ${cartCount} pcs` : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-2 rounded-md px-3 text-ui text-foreground no-underline transition-colors duration-150 hover:bg-muted hover:no-underline",
                  isActive &&
                    "font-semibold text-primary-strong after:absolute after:inset-x-3 after:-bottom-[11px] after:h-[3px] after:rounded-full after:bg-ochre",
                )}
              >
                {href === "/announcements" ? "Info" : label}
                {href === "/cart" && <CountBadge count={cartCount} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const AgentBottomNav = ({ cartCount, icons }: { cartCount: number; icons: NavIcons }): React.ReactNode => {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi bawah"
      data-print="hide"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid list-none grid-cols-4 p-0">
        {agentNavItems.map(({ href, label }) => {
          const isActive = isActivePath(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                aria-label={href === "/cart" && cartCount > 0 ? `${label}, ${cartCount} pcs` : label}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground no-underline hover:no-underline",
                  isActive &&
                    "font-semibold text-primary-strong before:absolute before:inset-x-6 before:top-0 before:h-[3px] before:rounded-b-full before:bg-ochre",
                )}
              >
                <span className="relative">
                  {isActive ? icons[href]?.active : icons[href]?.regular}
                  {href === "/cart" && <CountBadge count={cartCount} className="absolute -top-1.5 -right-3" />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
