"use client";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorPageProps): React.ReactNode => (
  <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-16">
    <h1>Maaf, terjadi kesalahan</h1>
    <p>
      Permintaan Anda belum berhasil diproses. Data yang sudah tersimpan tetap aman. Coba lagi beberapa saat lagi; jika masih
      gagal, hubungi admin Aurora dan sebutkan kode di bawah.
    </p>
    {error.digest && <p className="text-sm text-muted-foreground">Kode kesalahan: {error.digest}</p>}
    <Button onClick={reset} className="min-h-11 self-start px-5 font-semibold">
      Coba lagi
    </Button>
  </main>
);

export default ErrorPage;
