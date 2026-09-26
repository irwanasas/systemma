"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps): React.ReactNode => (
  <StatusPage
    icon={WarningCircle}
    title="Maaf, terjadi kesalahan"
    action={
      <Button onClick={reset} className="min-h-11 px-5 text-ui font-semibold">
        Coba lagi
      </Button>
    }
  >
    <p>
      Permintaan Anda belum berhasil diproses. Data yang sudah tersimpan tetap aman. Coba lagi beberapa saat lagi; jika masih
      gagal, hubungi admin Aurora dan sebutkan kode di bawah.
    </p>
    {error.digest && <p className="text-sm">Kode kesalahan: {error.digest}</p>}
  </StatusPage>
);

export default ErrorPage;
