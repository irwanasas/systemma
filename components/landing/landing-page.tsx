import Link from "next/link";
import { ArrowRight, CalendarCheck, Factory, GridFour, Megaphone, Storefront, Wallet } from "@phosphor-icons/react/ssr";
import { BrandMark } from "@/components/brand/brand-mark";
import { WaveDivider } from "@/components/landing/wave-divider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

type LandingPageProps = {
  businessName: string;
  city: string | null;
  dpPercent: number;
  dpWindowHours: number;
  etaDays: number;
};

const ochreButton = "min-h-12 bg-ochre px-6 text-base font-semibold text-ochre-foreground hover:bg-ochre/90";

export const LandingPage = ({ businessName, city, dpPercent, dpWindowHours, etaDays }: LandingPageProps): React.ReactNode => {
  const steps = [
    { icon: Storefront, title: "Pilih seri", text: "Lihat seri yang sedang dibuka untuk pre-order di katalog." },
    { icon: GridFour, title: "Pesan per warna × ukuran", text: "Isi jumlah pcs untuk setiap warna dan ukuran dalam satu tabel." },
    { icon: Wallet, title: `Bayar DP ${dpPercent}%`, text: `Transfer DP dalam ${dpWindowHours} jam setelah checkout, lalu unggah buktinya.` },
    { icon: Factory, title: "Produksi dimulai", text: `Estimasi selesai sekitar ${etaDays} hari setelah DP disetujui admin.` },
  ];
  const batchPoints = [
    { icon: CalendarCheck, text: "Setiap seri dibuka dalam batch PO dengan tanggal buka dan tutup." },
    { icon: Storefront, text: "Selama batch dibuka, agen bisa memesan kapan saja lewat portal." },
    { icon: Megaphone, text: "Jadwal batch berikutnya diumumkan di menu Info setelah masuk." },
  ];
  return (
    <div className="flex min-h-dvh flex-col">
      <header data-brand className="bg-brand text-brand-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <BrandMark size="sm" />
          <div className="flex items-center gap-1">
            <ThemeToggle className="text-brand-muted hover:bg-brand-accent hover:text-brand-foreground" />
            <Button asChild variant="ghost" className="min-h-11 text-ui text-brand-foreground hover:bg-brand-accent hover:text-brand-foreground">
              <Link href="/login" className="no-underline hover:no-underline">
                Masuk
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="!gap-0">
        <section data-brand aria-labelledby="hero-heading" className="relative overflow-hidden bg-brand text-brand-foreground">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-ochre/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute top-1/3 -left-20 size-72 rounded-full bg-rose/15 blur-3xl" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-12 pb-24 sm:pt-16 lg:flex-row lg:items-center lg:pb-32">
            <div className="flex flex-1 flex-col gap-5">
              <span className="w-fit rounded-full bg-ochre px-3 py-1 text-xs font-semibold tracking-wide text-ochre-foreground uppercase">
                Portal Pre-Order Agen
              </span>
              <h1 id="hero-heading" className="text-4xl leading-tight sm:text-5xl">
                Pre-order seri terbaru {businessName} untuk toko Anda
              </h1>
              <p className="max-w-xl text-lg text-brand-muted">
                Portal khusus agen untuk memesan seri pre-order per warna dan ukuran, membayar DP, dan memantau pesanan sampai
                dikirim.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className={ochreButton}>
                  <Link href="/login" className="no-underline hover:no-underline">
                    Masuk ke portal
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-12 border-brand-muted/40 bg-transparent px-6 text-base text-brand-foreground hover:bg-brand-accent hover:text-brand-foreground"
                >
                  <a href="#cara-pesan" className="no-underline hover:no-underline">
                    Cara pesan
                  </a>
                </Button>
              </div>
            </div>
            <div aria-hidden="true" className="hidden flex-1 items-center justify-center lg:flex">
              <span className="flex size-72 items-center justify-center rounded-full bg-brand-accent ring-1 ring-brand-border">
                <span className="flex size-52 items-center justify-center rounded-full bg-ochre font-heading text-8xl font-semibold text-ochre-foreground">
                  A
                </span>
              </span>
            </div>
          </div>
          <WaveDivider className="absolute bottom-0 left-0 h-12 w-full sm:h-16" />
        </section>

        <section id="cara-pesan" aria-labelledby="steps-heading" className="mx-auto w-full max-w-6xl scroll-mt-4 px-4 py-14">
          <h2 id="steps-heading" className="text-2xl sm:text-3xl">
            Cara pesan
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: StepIcon, title, text }, index) => (
              <li key={title} className="flex flex-col gap-3 rounded-xl border border-border border-t-[3px] border-t-ochre bg-surface p-5">
                <span className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
                    <StepIcon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="font-heading text-3xl font-semibold text-muted-foreground/60" aria-hidden="true">
                    {index + 1}
                  </span>
                </span>
                <h3>
                  <span className="sr-only">Langkah {index + 1}: </span>
                  {title}
                </h3>
                <p className="text-ui text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="batch-heading" className="bg-sand/60">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="flex flex-col gap-3">
              <h2 id="batch-heading" className="text-2xl sm:text-3xl">
                Batch PO
              </h2>
              <p className="text-muted-foreground">
                Pesanan dikumpulkan per batch, lalu diproduksi bersama setelah DP disetujui.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {batchPoints.map(({ icon: PointIcon, text }) => (
                <li key={text} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-ui">
                  <PointIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary-strong" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer data-brand className="mt-auto bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-12 text-center">
          <BrandMark size="md" />
          <p className="text-brand-muted">
            {businessName}
            {city && ` · ${city}`}
          </p>
          <Button asChild className={ochreButton}>
            <Link href="/login" className="no-underline hover:no-underline">
              Masuk ke portal
            </Link>
          </Button>
          <p className="text-sm text-brand-muted">
            © {new Date().getFullYear()} {businessName}
          </p>
        </div>
      </footer>
    </div>
  );
};
