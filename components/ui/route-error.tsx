"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export const RouteError = ({ error, reset }: RouteErrorProps): React.ReactNode => (
  <StatusPage
    icon={WarningCircle}
    title="Halaman gagal dimuat"
    action={
      <Button onClick={reset} className="min-h-11 px-5 text-ui font-semibold">
        Coba lagi
      </Button>
    }
  >
    <p>Data yang sudah tersimpan tetap aman. Coba lagi; jika masih gagal, hubungi admin Aurora dan sebutkan kode di bawah.</p>
    {error.digest && <p className="text-sm">Kode kesalahan: {error.digest}</p>}
  </StatusPage>
);
