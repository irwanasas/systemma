import { RoleHeader } from "@/components/layout/role-header";
import { requireRole } from "@/lib/auth/require-role";

const RoleLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("admin");
  return (
    <>
      <RoleHeader user={user} />
      {children}
    </>
  );
};

export default RoleLayout;
