import type { AppRole } from "@/features/auth/types";

export type NavLink = {
  href: string;
  label: string;
};

export const navLinksByRole: Record<AppRole, NavLink[]> = {
  agent: [
    { href: "/catalog", label: "Katalog" },
    { href: "/cart", label: "Keranjang" },
    { href: "/orders", label: "Pesanan" },
    { href: "/announcements", label: "Pengumuman" },
    { href: "/change-password", label: "Ganti password" },
  ],
  admin: [
    { href: "/dashboard", label: "Dasbor" },
    { href: "/orders", label: "Pesanan" },
    { href: "/payments", label: "Bukti DP" },
    { href: "/products", label: "Produk" },
    { href: "/po-batches", label: "Batch PO" },
    { href: "/agents", label: "Agen" },
    { href: "/recap", label: "Rekap" },
    { href: "/announcements", label: "Pengumuman" },
    { href: "/settings", label: "Pengaturan" },
    { href: "/audit-log", label: "Log audit" },
    { href: "/change-password", label: "Ganti password" },
  ],
};
