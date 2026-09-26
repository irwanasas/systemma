"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProps): React.ReactNode => (
  <html lang="id">
    <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1rem", maxWidth: "36rem", margin: "0 auto" }}>
      <h1>Maaf, aplikasi sedang bermasalah</h1>
      <p>Coba muat ulang halaman. Jika masih gagal, hubungi admin Aurora.</p>
      {error.digest && <p>Kode kesalahan: {error.digest}</p>}
      <button type="button" onClick={reset}>
        Coba lagi
      </button>
    </body>
  </html>
);

export default GlobalError;
