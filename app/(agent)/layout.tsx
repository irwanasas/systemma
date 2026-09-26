import { RoleShell } from "@/components/layout/role-shell";
import { requireRole } from "@/lib/auth/require-role";

const RoleLayout = async ({ children, modal }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  return (
    <RoleShell user={user}>
      {children}
      {modal}
    </RoleShell>
  );
};

export default RoleLayout;
