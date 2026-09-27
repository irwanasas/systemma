# Aurora — Sistem Pre-Order Agen

Portal pre-order untuk **Aurora Hijab** (Semarang) dan sekitar 47 agen (reseller). Aplikasi ini menggantikan alur lama lewat WhatsApp dan Excel, yang pembayarannya sering sulit dicocokkan dengan agen. Agen memesan seri per batch PO, membayar DP, lalu memantau pesanan sampai dikirim. Admin memeriksa bukti DP, menjalankan produksi dan pengiriman, lalu membuat rekap.

Spesifikasi lengkap ada di [`docs/ARCHITECT_BLUEPRINT.md`](docs/ARCHITECT_BLUEPRINT.md). Status harian ada di [`docs/progress.md`](docs/progress.md), dan keputusan desain di [`docs/adr/`](docs/adr).

---

## Daftar isi

1. [Istilah](#istilah)
2. [Fitur per peran](#fitur-per-peran)
3. [Alur pesanan dan status](#alur-pesanan-dan-status)
4. [Aturan inti (Konstitusi)](#aturan-inti-konstitusi)
5. [Teknologi](#teknologi)
6. [Struktur repo](#struktur-repo)
7. [Menjalankan di lokal](#menjalankan-di-lokal)
8. [Perintah npm](#perintah-npm)
9. [Pengujian](#pengujian)
10. [Operasional dan deploy](#operasional-dan-deploy)
11. [Roadmap](#roadmap)
12. [Dokumen terkait](#dokumen-terkait)

---

## Istilah

| Istilah | Arti | Nama di kode |
|---|---|---|
| Admin | Staf Aurora yang mengoperasikan sistem | `admin` |
| Agen | Reseller | `agent` |
| Seri | Model produk (Zelline, Anshara, Sevina Polka, …) | `product` |
| Kategori | Dress, Koko, Khimar + Voal | `category` |
| Varian | Warna × ukuran dari satu seri | `product_variant` |
| Ukuran standar | S, M, L, XL, XXL | `size_code` |
| Custom ukuran | Di luar ukuran standar: lingkar dada ≤ 140 cm, panjang badan ≤ 145 cm | `custom_chest_cm`, `custom_length_cm` |
| PO / Batch | Jendela pre-order per seri; batch lanjutan diberi label "B2" dan seterusnya | `po_batch` |
| Keranjang | Tempat menampung pesanan sebelum checkout | `cart` |
| DP | Uang muka 25%, dibayar paling lambat 24 jam setelah checkout lewat transfer, dengan bukti transfer | `dp_*` |
| Pelunasan | Sisa 75%; admin mengecek mutasi rekening lalu menandai lunas sebelum barang dikirim | `settlement` |
| Rekap | Laporan jumlah dan nilai pesanan per agen × seri dalam satu periode | `recap` |

## Fitur per peran

### Publik (tanpa login)
- Halaman depan `/`: penjelasan cara pesan, info batch PO, nama usaha dan kota.
- Halaman masuk `/login`, dengan pembatasan percobaan login.

### Agen
- **Katalog**: seri aktif yang batch PO-nya sedang dibuka, dengan harga per ukuran dan warna yang tersedia.
- **Modal pesan**: tabel warna × ukuran dengan navigasi panah keyboard. Di bawah 1024px tabel berubah jadi akordeon per warna dengan tombol + / −. Ada baris ukuran custom, dan total pcs, subtotal serta DP selalu terlihat.
- **Keranjang**: dikelompokkan per batch PO. Isi bisa diubah atau dihapus. Dialog checkout menampilkan teks konfirmasi (R-06), besar DP dan batas waktunya.
- **Pesanan**: hitung mundur DP, rekening bank dengan tombol salin, unggah bukti (file atau kamera), timeline status, estimasi selesai, invoice yang bisa dicetak, dan pembatalan sebelum DP.
- **Info**: pengumuman dari admin, pengaturan akun dan ganti password.

### Admin (back office)
- **Dasbor**: kartu KPI, daftar "Perlu perhatian", aksi cepat, dan grafik nilai pesanan mingguan serta jumlah per kategori.
- **Pesanan**: pencarian dan filter di database, halaman bernomor, dan detail pesanan dengan tombol langkah berikutnya (produksi, pelunasan, pengiriman).
- **Bukti DP**: antrean pemeriksaan satu per satu, dengan pratinjau bukti, nominal yang diharapkan vs yang dikirim, lalu setujui atau tolak (alasan wajib).
- **Notifikasi**: lonceng di header menampilkan 10 terbaru. Halaman `/notifications` bisa difilter per jenis, tanggal dan status baca, dan semuanya bisa ditandai dibaca.
- **Produk dan Batch PO**: buat, ubah, arsipkan; harga per ukuran, warna, harga custom; buka dan tutup batch.
- **Agen**: buat akun agen, nonaktifkan, reset password.
- **Pengumuman, Pengaturan, Log audit**: rekening bank, DP %, jendela DP, ETA default, batas ukuran custom, teks checkout, kop invoice, penerima notifikasi.
- **Rekap**: filter periode (preset atau tanggal), tabel per agen dengan total per kategori, grafik harian, dan ekspor XLSX.

Tampilan mendukung tema terang dan gelap, memenuhi WCAG 2.1 AA (dicek dengan axe di e2e), dan menghormati `prefers-reduced-motion`. Seluruh UI berbahasa Indonesia.

## Alur pesanan dan status

Satu pesanan selalu berisi **satu batch PO**. Keranjang yang berisi beberapa batch dipecah menjadi beberapa pesanan saat checkout.

```
checkout ─────────────────────────► AWAITING_DP (batas DP = sekarang + 24 jam)
AWAITING_DP ── agen membatalkan ──► CANCELLED
AWAITING_DP ── lewat 24 jam, tanpa bukti ──► EXPIRED          (pg_cron tiap 5 menit)
AWAITING_DP ── agen unggah bukti ──► DP_UNDER_REVIEW
DP_UNDER_REVIEW ── admin menolak (alasan) ──► AWAITING_DP (jendela 24 jam baru)
DP_UNDER_REVIEW ── admin menyetujui ──► DP_RECEIVED (invoice terbit, ETA = tanggal DP + 40 hari, pesanan terkunci)
DP_RECEIVED ──► IN_PRODUCTION ──► AWAITING_SETTLEMENT
AWAITING_SETTLEMENT ── admin tandai lunas ──► SETTLED ──► SHIPPED ──► COMPLETED
```

Setelah DP diterima, pesanan tidak bisa dibatalkan atau diubah. Ongkos kirim diurus di luar sistem.

- **Rumus DP**: `dp = ceil(subtotal × dp_percent / 100)`; `pelunasan = subtotal − dp`.
- **Format nomor**: pesanan `AUR-{YYYY}-{SEQ6}`, invoice `INV-{YYYY}-{SEQ6}`.

## Aturan inti (Konstitusi)

Aturan ini tidak boleh dilanggar. Setiap perubahan yang menyentuhnya harus dibahas dulu (lihat blueprint §3).

| ID | Aturan | Cara ditegakkan |
|---|---|---|
| K-01 | Uang selalu rupiah bulat (`bigint`), tidak pernah float | Tipe kolom, tipe `Rupiah` di TypeScript |
| K-02 | Semua penulisan ke pesanan, item, pembayaran dan invoice lewat fungsi Postgres (RPC) | Tidak ada grant atau policy untuk tulis langsung |
| K-03 | Otorisasi selalu dicek di server; menyembunyikan UI hanya kosmetik | `requireRole()` / cek kepemilikan di baris pertama setiap loader dan action |
| K-04 | Aksi keuangan dan checkout idempoten | Kolom `idempotency_key` UNIQUE |
| K-05 | Harga pesanan adalah snapshot saat checkout | `order_items.unit_price` |
| K-06 | Status hanya berubah mengikuti graf di atas | `order_transition()` + pgTAP untuk 100 pasangan status |
| K-07 | Service-role key hanya di server | `import "server-only"` di `lib/supabase/admin.ts` |
| K-08 | Waktu disimpan `timestamptz` UTC, ditampilkan `Asia/Jakarta` | `lib/dates.ts` |
| K-09 | Tidak ada merge ke `main` jika typecheck, lint atau test gagal | GitHub Actions |

## Teknologi

- **Aplikasi**: Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript strict, Node 22.
- **UI**: Tailwind CSS v4, shadcn/ui di atas `radix-ui`, ikon Phosphor, `sonner`, `next-themes`, Recharts (dimuat hanya saat terlihat), font Inter dan Fraunces.
- **State**: Server Components + Server Actions; Zustand hanya untuk tabel pesan; skema Zod dipakai bersama form dan action.
- **Data**: Supabase Postgres, Storage (bucket privat `payment-proofs` dengan signed URL singkat), pg_cron. Akses lewat `supabase-js` dengan service-role key di server saja. Tanpa ORM; migrasi berupa SQL biasa.
- **Auth**: buatan sendiri (bukan Supabase Auth). Password bcrypt cost 12, token sesi 32 byte disimpan sebagai sha256, cookie `aurora_session` 7 hari yang diperpanjang otomatis dengan batas umur absolut.
- **Ekspor**: `exceljs`, hanya di server.
- **Test**: Vitest, pgTAP, Playwright + axe.
- **CI**: GitHub Actions (typecheck → lint → unit → pgTAP → build → e2e).
- **Hosting target**: Vercel + Supabase (region Singapura).

## Struktur repo

```
app/
  (public)/login/            halaman masuk
  (agent)/                   layout agen (requireRole "agent")
    catalog/(list)/          katalog
    catalog/[product-slug]/  halaman pesan penuh
    @modal/(.)catalog/…      modal pesan (intercepting route)
    cart/                    keranjang
  (admin)/                   layout admin (requireRole "admin")
    dashboard/ orders… payments/ notifications/ products/ po-batches/
    agents/ recap/ settings/ audit-log/
  (shared)/                  dipakai kedua peran
    orders/                  daftar dan detail pesanan
    announcements/           pengumuman / Info
  change-password/           paksa ganti password
  api/health/                health check
  page.tsx                   landing publik
features/<modul>/            server/queries.ts, server/actions.ts, schemas, types, components/
  auth, catalog, cart, orders, payments, po-batches, recap, dashboard,
  notifications, announcements, settings, audit, landing
components/
  ui/                        komponen dasar (shadcn + milik sendiri)
  layout/                    shell admin & agen, sidebar, navigasi, lonceng notifikasi
  charts/                    kartu grafik + Recharts (lazy)
  brand/ landing/ theme/
lib/
  auth/                      password, session, require-role, rate-limit, cookie
  supabase/                  klien admin (server-only) + tipe database
  money.ts dates.ts errors.ts env.ts list-params.ts utils.ts
supabase/
  migrations/                skema, RPC, trigger, cron
  tests/                     pgTAP
  seed.sql                   data dasar lokal
  demo/                      data demo (pesanan, bukti) untuk screenshot
tests/
  unit/                      Vitest
  e2e/                       Playwright
docs/                        blueprint, ADR, progress, operasional, audit desain, screenshot UI
proxy.ts                     cek cookie sesi; hanya "/" dan file ikon yang publik
```

## Menjalankan di lokal

Yang dibutuhkan: Node 22, Docker, dan psql.

```bash
npm ci
cp .env.example .env.local
npm run db:start
```

`npm run db:start` menjalankan Supabase lokal di Docker. Setelah itu, isi `.env.local` dengan nilai dari `npx supabase status`:

```
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role key lokal>
```

Lalu siapkan database dan jalankan aplikasi:

```bash
npm run db:reset    # migrasi + seed dasar; password akun dicetak sekali di terminal
npm run dev         # http://localhost:3000
```

Untuk data contoh yang lengkap (pesanan di berbagai status, bukti DP, notifikasi), pakai `npm run db:demo` sebagai ganti `db:reset`.

Seed hanya bisa berjalan ke database lokal. Pengamannya ada di [`docs/operations.md`](docs/operations.md#first-admin-in-production).

## Perintah npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` / `npm start` | Build dan jalankan versi produksi |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit test (Vitest) |
| `npm run db:start` | Menyalakan Supabase lokal (layanan minimal) |
| `npm run db:reset` | Reset database + seed dasar |
| `npm run db:demo` | Reset + seed dasar + data demo + unggah bukti contoh |
| `npm run db:types` | Regenerasi `lib/supabase/database.types.ts` |
| `npm run test:db` | Test pgTAP |
| `npm run test:e2e` | Test Playwright (menyalakan server sendiri di port 3000) |

## Pengujian

Urutan lengkap sebelum commit:

```bash
npm run typecheck && npm run lint && npm test
npm run db:reset && npm run test:db
npx playwright test
```

| Lapisan | Jumlah | Yang dicek |
|---|---|---|
| Unit (Vitest) | 47 | Uang, tanggal, password, token sesi, file bukti, filter daftar, rekap, bucket grafik |
| pgTAP | 95 | Akses, `create_agent`, `price_quote`, checkout (split, snapshot, idempoten, batal), seluruh graf status, rekap |
| E2E (Playwright) | 48 | Login dan rate limit, lintas peran, katalog → checkout → DP → produksi → pelunasan → kirim, notifikasi, back office, rekap + XLSX, pencarian pesanan, landing, aksesibilitas (axe, terang dan gelap), keyboard dan akordeon tabel pesan |

## Operasional dan deploy

Detail ada di [`docs/operations.md`](docs/operations.md), yang mencakup:

- Variabel lingkungan: `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` (server saja). Anon key tidak dipakai.
- Job pg_cron: `expire-unpaid-orders` tiap 5 menit, `cleanup-auth-records` harian.
- Cara membuat admin pertama di produksi.
- Backup dan latihan restore.
- Rate limit dan header keamanan.
- Checklist insiden.

## Roadmap

### Selesai

| Fase | Isi | ADR |
|---|---|---|
| F0 | Setup repo: Next.js, Tailwind v4, shadcn, Vitest, Playwright, pgTAP, CI, health check | [0001](docs/adr/0001-f0-tooling.md) |
| F1 | Auth: tabel users/agents/sessions/login_attempts, bcrypt, sesi, rate limit, `requireRole`, proxy, paksa ganti password, admin kelola agen | [0002](docs/adr/0002-f1-auth.md) |
| F2 | Katalog: kategori, ukuran, produk, warna, harga per ukuran, custom, varian, batch PO, `price_quote` | [0003](docs/adr/0003-f2-catalog.md) |
| F3 | Keranjang dan checkout: RPC keranjang, `checkout_cart` (split per batch, snapshot, idempoten), batal sebelum DP | [0004](docs/adr/0004-f3-cart-checkout.md) |
| F4 | Pembayaran: unggah bukti DP, antrean review, invoice, kedaluwarsa otomatis, transisi produksi/kirim, pelunasan | [0005](docs/adr/0005-f4-payments.md) |
| F5 | Back office: notifikasi, pengumuman, pengaturan, log audit | [0006](docs/adr/0006-f5-back-office.md) |
| F6 | UI: token, tabel pesan (keyboard + akordeon), keranjang, hitung mundur DP, timeline, invoice cetak, antrean review | [0007](docs/adr/0007-f6-ui.md) |
| F7 | Rekap: `recap_by_agent_series`, halaman rekap, ekspor XLSX | [0008](docs/adr/0008-f7-recap.md) |
| F8 | Pengerasan: review keamanan, header, sesi absolut, audit append-only, halaman error, cleanup harian, dokumen operasional | [0009](docs/adr/0009-f8-hardening.md) |
| UI pass | Shell dan navigasi, modal pesan, katalog, daftar pesanan, produk (tab), rekap, halaman status | [0010](docs/adr/0010-ui-pass.md) |
| Brand pass | Palet terakota + mode gelap, Fraunces, landing publik, login baru, dasbor KPI dan grafik, kontrol daftar, skeleton | [0011](docs/adr/0011-brand-pass.md) |
| Lanjutan brand | Palet lebih lembut, grafik batang harian di Rekap, panel lonceng + halaman `/notifications` | [0011](docs/adr/0011-brand-pass.md) |
| Performa | Grafik dimuat saat terlihat, shell per peran, perpanjangan sesi setelah respons, query keranjang dan modal paralel | [progress](docs/progress.md#performance-pass) |

### Sedang berjalan

- **Logo asli Aurora**: tanda "A" dalam lingkaran di shell dan ikon (32/180/512), logo penuh di landing dan login. Menunggu persetujuan.
- **Logo landing lazy** (temuan performa 6): ikut commit logo.

### Menunggu masukan klien

- Kontak di footer landing (WhatsApp, Instagram, alamat lengkap). Sekarang hanya nama usaha dan kota.
- Foto produk. Katalog saat ini memakai swatch warna.
- Asumsi blueprint §10 yang belum dikonfirmasi:
  - Bukti DP yang ditolak memberi jendela 24 jam baru.
  - Batas minimum ukuran custom hanya "lebih dari 0".

### Berikutnya

- **Deploy produksi**: proyek Supabase (Singapura) + Vercel, admin pertama, cron aktif, latihan restore.
- **Saran database** (perlu persetujuan karena mengubah skema):
  - Index `orders(created_at)` untuk rentang tanggal di dasbor dan rekap.
  - Satu fungsi hitung untuk 7 query hitung di dasbor.
  - Index parsial notifikasi yang belum dibaca.
- **Perbaikan kecil yang terbuka**:
  - Skeleton halaman sebelumnya sempat terlihat saat pindah dari halaman admin ke `/orders`.
  - `proxy.ts` masih mengecualikan path yang diawali `login`.
  - Kontrol 36px di kepadatan admin pada layar ponsel.

### Ditunda (baru dibangun jika disetujui)

- **Saldo deposit agen** (blueprint §7): tabel `balances` + mutasi append-only lewat satu fungsi `ledger_post`, dengan idempotensi dan uji double-spend. Desain pesanan dan pembayaran sudah siap untuk `method = 'DEPOSIT'`.
- **OCR bukti transfer**: opsi masa depan.

### Di luar cakupan

Peran sales, harga bertingkat atau grosir, satuan lusin/bundel, ongkos kirim, email/OTP, payment gateway.

## Dokumen terkait

- [`docs/ARCHITECT_BLUEPRINT.md`](docs/ARCHITECT_BLUEPRINT.md): domain, kebutuhan R-01…R-19, konstitusi, model data, graf status, fase.
- [`docs/progress.md`](docs/progress.md): catatan per fase dan hasil pengujian.
- [`docs/adr/`](docs/adr): keputusan arsitektur dan desain per fase.
- [`docs/operations.md`](docs/operations.md): operasional produksi.
- [`docs/design-audit.md`](docs/design-audit.md): catatan audit desain.
- [`docs/ui/`](docs/ui): screenshot sebelum dan sesudah.
