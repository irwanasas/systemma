"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { adminNavGroups, isActivePath } from "@/components/layout/nav-config";
import type { NavIcons } from "@/components/layout/nav-icons";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

export const AdminSidebar = ({ icons }: { icons: NavIcons }): React.ReactNode => {
  const pathname = usePathname();
  return (
    <Sidebar aria-label="Navigasi back office">
      <SidebarHeader className="px-4 py-4">
        <Link href="/dashboard" className="text-sidebar-foreground no-underline hover:no-underline">
          <BrandMark size="sm" tagline="Back office" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {adminNavGroups.map(({ label, items }) => (
          <SidebarGroup key={label}>
            <SidebarGroupLabel className="text-xs font-semibold tracking-wide text-brand-muted uppercase">
              {label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ href, label: itemLabel }) => {
                  const isActive = isActivePath(pathname, href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "relative h-9 text-ui text-brand-muted hover:bg-sidebar-accent hover:text-sidebar-foreground",
                          isActive &&
                            "text-sidebar-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-ochre",
                        )}
                      >
                        <Link href={href} aria-current={isActive ? "page" : undefined} className="no-underline hover:no-underline">
                          {isActive ? icons[href]?.active : icons[href]?.regular}
                          <span>{itemLabel}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
