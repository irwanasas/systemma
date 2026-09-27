import type { Icon } from "@phosphor-icons/react";
import {
  Bell,
  CalendarBlank,
  ChartBar,
  ClockCounterClockwise,
  Dress,
  GearSix,
  Info,
  Megaphone,
  Package,
  Receipt,
  SealCheck,
  ShoppingBag,
  SquaresFour,
  Storefront,
  UsersThree,
} from "@phosphor-icons/react/ssr";

export type NavIcons = Record<string, { regular: React.ReactNode; active: React.ReactNode }>;

const renderIcons = (icons: Record<string, Icon>, className: string, activeClassName: string): NavIcons =>
  Object.fromEntries(
    Object.entries(icons).map(([href, NavIcon]) => [
      href,
      {
        regular: <NavIcon aria-hidden="true" className={className} />,
        active: <NavIcon aria-hidden="true" weight="fill" className={`${className} ${activeClassName}`.trim()} />,
      },
    ]),
  );

export const adminNavIcons = (): NavIcons =>
  renderIcons(
    {
      "/dashboard": SquaresFour,
      "/orders": Receipt,
      "/payments": SealCheck,
      "/notifications": Bell,
      "/products": Dress,
      "/po-batches": CalendarBlank,
      "/agents": UsersThree,
      "/announcements": Megaphone,
      "/recap": ChartBar,
      "/settings": GearSix,
      "/audit-log": ClockCounterClockwise,
    },
    "",
    "text-ochre",
  );

export const agentNavIcons = (): NavIcons =>
  renderIcons({ "/catalog": Storefront, "/cart": ShoppingBag, "/orders": Package, "/announcements": Info }, "size-6", "");
