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
    { href: "/change-password", label: "Ganti password" },
  ],
  admin: [
    { href: "/dashboard", label: "Dasbor" },
    { href: "/orders", label: "Pesanan" },
    { href: "/payments", label: "Bukti DP" },
    { href: "/products", label: "Produk" },
    { href: "/po-batches", label: "Batch PO" },
    { href: "/agents", label: "Agen" },
    { href: "/change-password", label: "Ganti password" },
  ],
};
