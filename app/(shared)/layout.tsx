import { AppHeader } from "@/components/layout/app-header";
import { navLinksByRole } from "@/components/layout/nav-links";
import { requireActiveUser } from "@/lib/auth/require-role";

const SharedLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  return (
    <>
      <AppHeader fullName={user.fullName} links={navLinksByRole[user.role]} />
      {children}
    </>
  );
};

export default SharedLayout;
