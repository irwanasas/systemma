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

export const AdminSidebar = (): React.ReactNode => {
  const pathname = usePathname();
  return (
    <Sidebar aria-label="Navigasi back office">
      <SidebarHeader className="px-4 py-4">
        <Link href="/dashboard" className="flex flex-col text-foreground no-underline">
          <span className="text-lg font-semibold tracking-tight">Aurora</span>
          <span className="text-xs text-muted-foreground">Back office</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {adminNavGroups.map(({ label, items }) => (
          <SidebarGroup key={label}>
            <SidebarGroupLabel className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ href, label: itemLabel, icon: ItemIcon }) => {
                  const isActive = isActivePath(pathname, href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={isActive} className="h-9 text-ui">
                        <Link href={href} aria-current={isActive ? "page" : undefined} className="text-foreground no-underline">
                          <ItemIcon aria-hidden="true" weight={isActive ? "fill" : "regular"} />
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
