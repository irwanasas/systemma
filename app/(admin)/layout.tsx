import { AdminShell } from "@/components/layout/admin-shell";
import { requireRole } from "@/lib/auth/require-role";

const RoleLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  return <AdminShell user={user}>{children}</AdminShell>;
};

export default RoleLayout;
