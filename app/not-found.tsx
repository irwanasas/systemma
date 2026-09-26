import Link from "next/link";
import { Compass } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

const NotFoundPage = (): React.ReactNode => (
  <StatusPage
    icon={Compass}
    title="Halaman tidak ditemukan"
    action={
      <Button asChild className="min-h-11 px-5 text-ui">
        <Link href="/" className="text-primary-foreground no-underline hover:no-underline">
          Kembali ke beranda
        </Link>
      </Button>
    }
  >
    <p>Halaman yang Anda cari tidak ada atau Anda tidak punya akses ke halaman ini.</p>
  </StatusPage>
);

export default NotFoundPage;
