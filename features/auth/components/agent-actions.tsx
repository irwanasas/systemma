"use client";

import { useActionState } from "react";
import { deactivateAgent, resetAgentPassword } from "@/features/auth/server/actions";
import type { FormState } from "@/features/auth/types";

type AgentActionsProps = {
  userId: string;
  username: string;
  isActive: boolean;
};

const initialState: FormState = {};

export const AgentActions = ({ userId, username, isActive }: AgentActionsProps): React.ReactNode => {
  const [state, resetAction, isResetting] = useActionState(resetAgentPassword, initialState);
  if (!isActive) return <span>Nonaktif</span>;
  return (
    <>
      <form action={resetAction}>
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" disabled={isResetting} aria-label={`Atur ulang password ${username}`}>
          {isResetting ? "Memproses…" : "Atur ulang password"}
        </button>
      </form>
      <form
        action={deactivateAgent}
        onSubmit={(event) => {
          if (!window.confirm(`Nonaktifkan ${username}? Agen ini tidak akan bisa masuk lagi.`)) event.preventDefault();
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <button type="submit" aria-label={`Nonaktifkan ${username}`}>
          Nonaktifkan
        </button>
      </form>
      {state.error && <p role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
    </>
  );
};
