import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { AgentBottomNav, AgentTopNav } from "@/components/layout/agent-nav";
import { agentNavIcons } from "@/components/layout/nav-icons";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { CurrentUser } from "@/features/auth/types";
import { getCartItemCount } from "@/features/cart/server/queries";

export const AgentShell = async ({ user, children }: { user: CurrentUser; children: React.ReactNode }): Promise<React.ReactNode> => {
  const cartCount = await getCartItemCount(user.id);
  return (
    <div data-density="comfortable" className="min-h-dvh pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link href="/catalog" className="text-foreground no-underline hover:no-underline">
            <BrandMark size="sm" />
          </Link>
          <AgentTopNav cartCount={cartCount} />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <AccountMenu fullName={user.fullName} roleLabel="Agen" />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-6">{children}</div>
      <AgentBottomNav cartCount={cartCount} icons={agentNavIcons()} />
    </div>
  );
};
