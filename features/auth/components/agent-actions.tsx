"use client";

import { useState } from "react";
import { DotsThreeVertical, Key, UserMinus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deactivateAgent, resetAgentPassword } from "@/features/auth/server/actions";

type AgentActionsProps = {
  userId: string;
  username: string;
  isActive: boolean;
};

export const AgentActions = ({ userId, username, isActive }: AgentActionsProps): React.ReactNode => {
  const [dialog, setDialog] = useState<"reset" | "deactivate" | null>(null);
  if (!isActive) return null;
  const closeDialog = (open: boolean): void => {
    if (!open) setDialog(null);
  };
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Tindakan ${username}`} className="size-9 text-muted-foreground">
            <DotsThreeVertical aria-hidden="true" weight="bold" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem className="min-h-10 text-ui" onSelect={() => setDialog("reset")}>
            <Key aria-hidden="true" />
            Atur ulang password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" className="min-h-10 text-ui" onSelect={() => setDialog("deactivate")}>
            <UserMinus aria-hidden="true" />
            Nonaktifkan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmActionDialog
        open={dialog === "reset"}
        onOpenChange={closeDialog}
        action={resetAgentPassword}
        fields={{ userId }}
        title="Atur ulang password?"
        message={`Password ${username} diganti dengan password acak. Agen harus masuk ulang dan mengganti password.`}
        confirmLabel={`Atur ulang password ${username}`}
        pendingLabel="Mengatur ulang…"
      />
      <ConfirmActionDialog
        open={dialog === "deactivate"}
        onOpenChange={closeDialog}
        action={deactivateAgent}
        fields={{ userId }}
        title="Nonaktifkan agen?"
        message={`Nonaktifkan ${username}? Agen ini tidak akan bisa masuk lagi.`}
        confirmLabel={`Nonaktifkan ${username}`}
        pendingLabel="Menonaktifkan…"
        destructive
      />
    </>
  );
};
