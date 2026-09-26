import Link from "next/link";

const NotFoundPage = (): React.ReactNode => (
  <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-16">
    <h1>Halaman tidak ditemukan</h1>
    <p>Halaman yang Anda cari tidak ada atau Anda tidak punya akses ke halaman ini.</p>
    <p>
      <Link href="/">Kembali ke beranda</Link>
    </p>
  </main>
);

export default NotFoundPage;
