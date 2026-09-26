import { ActionForm } from "@/components/ui/action-form";
import { deactivateAgent, resetAgentPassword } from "@/features/auth/server/actions";

type AgentActionsProps = {
  userId: string;
  username: string;
  isActive: boolean;
};

export const AgentActions = ({ userId, username, isActive }: AgentActionsProps): React.ReactNode => {
  if (!isActive) return <span>Nonaktif</span>;
  return (
    <>
      <ActionForm action={resetAgentPassword} submitLabel={`Atur ulang password ${username}`}>
        <input type="hidden" name="userId" value={userId} />
      </ActionForm>
      <ActionForm
        action={deactivateAgent}
        submitLabel={`Nonaktifkan ${username}`}
        confirmMessage={`Nonaktifkan ${username}? Agen ini tidak akan bisa masuk lagi.`}
      >
        <input type="hidden" name="userId" value={userId} />
      </ActionForm>
    </>
  );
};
