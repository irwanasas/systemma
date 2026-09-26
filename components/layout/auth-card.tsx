import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const AuthCard = ({ children, homeLink = false }: { children: React.ReactNode; homeLink?: boolean }): React.ReactNode => (
  <div data-brand className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden bg-brand px-4 py-10 text-brand-foreground">
    <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-ochre/10 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-rose/15 blur-3xl" />
    <ThemeToggle className="absolute top-4 right-4 text-brand-muted hover:bg-brand-accent hover:text-brand-foreground" />
    {homeLink ? (
      <Link href="/" className="group relative flex flex-col items-center gap-2 text-brand-foreground no-underline hover:no-underline">
        <span className="transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
          <BrandMark size="lg" wordmark={false} />
        </span>
        <span className="font-heading text-2xl font-semibold tracking-tight">Aurora</span>
        <span className="text-sm text-brand-muted transition-colors group-hover:text-ochre">Kembali ke beranda</span>
      </Link>
    ) : (
      <span className="relative flex flex-col items-center gap-2">
        <BrandMark size="lg" wordmark={false} />
        <span className="font-heading text-2xl font-semibold tracking-tight">Aurora</span>
      </span>
    )}
    <div data-surface className="relative w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-foreground shadow-xl sm:p-8">{children}</div>
    <p className="relative text-sm text-brand-muted">Sistem pre-order Aurora Hijab</p>
  </div>
);
