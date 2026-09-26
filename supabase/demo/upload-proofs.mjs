import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(SUPABASE_URL).hostname)) {
  throw new Error(`demo proofs are uploaded to the local Supabase only, got ${new URL(SUPABASE_URL).hostname}`);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

const { data: payments, error } = await supabase
  .from("payments")
  .select("proof_path, amount, created_at, orders!inner(number, agents!inner(users!inner(full_name)))")
  .like("proof_path", "%demo-proof.png");
if (error) throw error;

const browser = await chromium.launch({ executablePath: PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 420, height: 640 }, deviceScaleFactor: 2 });

for (const payment of payments) {
  const sender = payment.orders.agents.users.full_name.toUpperCase();
  const time = new Date(payment.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
  await page.setContent(`
    <body style="margin:0;font-family:system-ui,sans-serif;background:#eef3f8;color:#10243e">
      <div style="margin:24px;padding:24px;border-radius:16px;background:#fff">
        <div style="font-weight:700;color:#0060af;font-size:20px">m-Transfer</div>
        <div style="margin-top:4px;color:#2e7d32;font-weight:600">Transaksi Berhasil</div>
        <div style="margin-top:20px;font-size:13px;color:#5b6b7f">Nominal</div>
        <div style="font-size:30px;font-weight:700">${rupiah.format(payment.amount)}</div>
        <table style="margin-top:20px;width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#5b6b7f">Tanggal</td><td style="text-align:right">${time} WIB</td></tr>
          <tr><td style="padding:6px 0;color:#5b6b7f">Dari</td><td style="text-align:right">${sender}</td></tr>
          <tr><td style="padding:6px 0;color:#5b6b7f">Ke rekening</td><td style="text-align:right">8730 1234 56</td></tr>
          <tr><td style="padding:6px 0;color:#5b6b7f">Nama penerima</td><td style="text-align:right">CV AURORA HIJAB SEMARANG</td></tr>
          <tr><td style="padding:6px 0;color:#5b6b7f">Berita</td><td style="text-align:right">DP ${payment.orders.number}</td></tr>
          <tr><td style="padding:6px 0;color:#5b6b7f">No. referensi</td><td style="text-align:right">${Math.abs(payment.amount * 7919) % 100000000}</td></tr>
        </table>
      </div>
    </body>`);
  const image = await page.screenshot({ type: "png" });
  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(payment.proof_path, image, { contentType: "image/png", upsert: true });
  if (uploadError) throw uploadError;
}

await browser.close();
console.log(`uploaded ${payments.length} demo proofs`);
