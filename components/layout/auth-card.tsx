export const AuthCard = ({ children }: { children: React.ReactNode }): React.ReactNode => (
  <div className="flex min-h-dvh items-center justify-center px-4 py-10">
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">{children}</div>
  </div>
);
