import { AppHeader } from "@/components/layout/app-header";
import { requireRole } from "@/lib/auth/require-role";

const adminLinks = [
  { href: "/dashboard", label: "Dasbor" },
  { href: "/products", label: "Produk" },
  { href: "/po-batches", label: "Batch PO" },
  { href: "/agents", label: "Agen" },
  { href: "/change-password", label: "Ganti password" },
];

const AdminLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  return (
    <>
      <AppHeader fullName={user.fullName} links={adminLinks} />
      {children}
    </>
  );
};

export default AdminLayout;
