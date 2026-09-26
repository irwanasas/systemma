export const AuthCard = ({ children }: { children: React.ReactNode }): React.ReactNode => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
    <p className="text-lg font-semibold tracking-tight">Aurora</p>
    <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">{children}</div>
    <p className="text-sm text-muted-foreground">Sistem pre-order Aurora Hijab</p>
  </div>
);
