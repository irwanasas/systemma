import { RoleShell } from "@/components/layout/role-shell";
import { requireActiveUser } from "@/lib/auth/require-role";

const SharedLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  return <RoleShell user={user}>{children}</RoleShell>;
};

export default SharedLayout;
