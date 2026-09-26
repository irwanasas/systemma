import { RoleHeader } from "@/components/layout/role-header";
import { requireActiveUser } from "@/lib/auth/require-role";

const SharedLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  return (
    <>
      <RoleHeader user={user} />
      {children}
    </>
  );
};

export default SharedLayout;
