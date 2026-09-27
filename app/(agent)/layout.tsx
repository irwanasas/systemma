import { AgentShell } from "@/components/layout/agent-shell";
import { requireRole } from "@/lib/auth/require-role";

const RoleLayout = async ({ children, modal }: LayoutProps<"/">): Promise<React.ReactNode> => {
  const user = await requireRole("agent");
  return (
    <AgentShell user={user}>
      {children}
      {modal}
    </AgentShell>
  );
};

export default RoleLayout;
