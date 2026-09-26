import { AppHeader } from "@/components/layout/app-header";
import { navLinksByRole } from "@/components/layout/nav-links";
import { requireRole } from "@/lib/auth/require-role";

const RoleLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  return (
    <>
      <AppHeader fullName={user.fullName} links={navLinksByRole.agent} />
      {children}
    </>
  );
};

export default RoleLayout;
