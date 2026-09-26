import { PageBody, PageShell } from "@/components/layout/page-shell";
import { RoleHeader } from "@/components/layout/role-header";
import { requireRole } from "@/lib/auth/require-role";

const RoleLayout = async ({ children }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  return (
    <PageShell role={user.role}>
      <RoleHeader user={user} />
      <PageBody>{children}</PageBody>
    </PageShell>
  );
};

export default RoleLayout;
