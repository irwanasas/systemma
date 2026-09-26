import { PageBody, PageShell } from "@/components/layout/page-shell";
import { RoleHeader } from "@/components/layout/role-header";
import { requireActiveUser } from "@/lib/auth/require-role";

const SharedLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireActiveUser();
  return (
    <PageShell role={user.role}>
      <RoleHeader user={user} />
      <PageBody>{children}</PageBody>
    </PageShell>
  );
};

export default SharedLayout;
