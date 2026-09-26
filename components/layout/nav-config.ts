import {
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
  type Icon,
} from "@phosphor-icons/react";

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    label: "Operasional",
    items: [
      { href: "/dashboard", label: "Dasbor", icon: SquaresFour },
      { href: "/orders", label: "Pesanan", icon: Receipt },
      { href: "/payments", label: "Bukti DP", icon: SealCheck },
    ],
  },
  {
    label: "Katalog",
    items: [
      { href: "/products", label: "Produk", icon: Dress },
      { href: "/po-batches", label: "Batch PO", icon: CalendarBlank },
    ],
  },
  {
    label: "Agen & Info",
    items: [
      { href: "/agents", label: "Agen", icon: UsersThree },
      { href: "/announcements", label: "Pengumuman", icon: Megaphone },
      { href: "/recap", label: "Rekap", icon: ChartBar },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/settings", label: "Pengaturan", icon: GearSix },
      { href: "/audit-log", label: "Log audit", icon: ClockCounterClockwise },
    ],
  },
];

export const agentNavItems: NavItem[] = [
  { href: "/catalog", label: "Katalog", icon: Storefront },
  { href: "/cart", label: "Keranjang", icon: ShoppingBag },
  { href: "/orders", label: "Pesanan", icon: Package },
  { href: "/announcements", label: "Info", icon: Info },
];

export const isActivePath = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
