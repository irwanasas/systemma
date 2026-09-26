import type { AppRole } from "@/features/auth/types";

export const PageShell = ({ role, children }: { role: AppRole; children: React.ReactNode }): React.ReactNode => (
  <div data-density={role === "admin" ? "compact" : "comfortable"} className="min-h-dvh">
    {children}
  </div>
);

export const PageBody = ({ children }: { children: React.ReactNode }): React.ReactNode => (
  <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-24">{children}</div>
);
