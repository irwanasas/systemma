import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth/require-role";

const RoleLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  return <RoleShell user={user}>{children}</RoleShell>;
};

export default RoleLayout;
