import { AdminShell } from "@/components/layout/admin-shell";
import { AgentShell } from "@/components/layout/agent-shell";
import type { CurrentUser } from "@/features/auth/types";

export const RoleShell = ({ user, children }: { user: CurrentUser; children: React.ReactNode }): React.ReactNode =>
  user.role === "admin" ? <AdminShell user={user}>{children}</AdminShell> : <AgentShell user={user}>{children}</AgentShell>;
