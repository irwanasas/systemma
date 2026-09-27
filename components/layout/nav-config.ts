export type NavItem = {
  href: string;
  label: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const adminNavGroups: NavGroup[] = [
  {
    label: "Operasional",
    items: [
      { href: "/dashboard", label: "Dasbor" },
      { href: "/orders", label: "Pesanan" },
      { href: "/payments", label: "Bukti DP" },
      { href: "/notifications", label: "Notifikasi" },
    ],
  },
  {
    label: "Katalog",
    items: [
      { href: "/products", label: "Produk" },
      { href: "/po-batches", label: "Batch PO" },
    ],
  },
  {
    label: "Agen & Info",
    items: [
      { href: "/agents", label: "Agen" },
      { href: "/announcements", label: "Pengumuman" },
      { href: "/recap", label: "Rekap" },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/settings", label: "Pengaturan" },
      { href: "/audit-log", label: "Log audit" },
    ],
  },
];

export const agentNavItems: NavItem[] = [
  { href: "/catalog", label: "Katalog" },
  { href: "/cart", label: "Keranjang" },
  { href: "/orders", label: "Pesanan" },
  { href: "/announcements", label: "Info" },
];

export const isActivePath = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);
