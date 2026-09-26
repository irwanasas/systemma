import { ActionForm } from "@/components/ui/action-form";
import { BANK_ROWS } from "@/features/settings/schemas";
import { saveNotificationRecipients, saveSettingsSection } from "@/features/settings/server/actions";
import { getSettings, listAdmins } from "@/features/settings/server/queries";
import { requireRole } from "@/lib/auth/require-role";

const SettingsPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const [settings, admins] = await Promise.all([getSettings(), listAdmins()]);

  return (
    <main>
      <h1>Pengaturan</h1>

      <section aria-labelledby="bank-heading">
        <h2 id="bank-heading">Rekening tujuan transfer</h2>
        <p>Ditampilkan ke agen saat membayar DP. Kosongkan baris yang tidak dipakai.</p>
        <ActionForm action={saveSettingsSection} submitLabel="Simpan rekening" pendingLabel="Menyimpan…">
          <input type="hidden" name="section" value="bankAccounts" />
          {Array.from({ length: BANK_ROWS }, (_, index) => {
            const account = settings.bank_accounts[index];
            return (
              <fieldset key={index}>
                <legend>Rekening {index + 1}</legend>
                <div>
                  <label htmlFor={`bank${index}`}>Nama bank</label>
                  <input id={`bank${index}`} name={`bank${index}`} defaultValue={account?.bank} />
                </div>
                <div>
                  <label htmlFor={`number${index}`}>Nomor rekening</label>
                  <input id={`number${index}`} name={`number${index}`} inputMode="numeric" defaultValue={account?.number} />
                </div>
                <div>
                  <label htmlFor={`holder${index}`}>Atas nama</label>
                  <input id={`holder${index}`} name={`holder${index}`} defaultValue={account?.holder} />
                </div>
              </fieldset>
            );
          })}
        </ActionForm>
      </section>

      <section aria-labelledby="payment-rules-heading">
        <h2 id="payment-rules-heading">DP dan estimasi</h2>
        <p>Perubahan hanya berlaku untuk pesanan baru.</p>
        <ActionForm action={saveSettingsSection} submitLabel="Simpan aturan DP" pendingLabel="Menyimpan…">
          <input type="hidden" name="section" value="paymentRules" />
          <div>
            <label htmlFor="dpPercent">DP (% dari subtotal)</label>
            <input id="dpPercent" name="dpPercent" type="number" min={1} max={100} defaultValue={settings.dp_percent} required />
          </div>
          <div>
            <label htmlFor="dpWindowHours">Batas waktu bayar DP (jam setelah checkout)</label>
            <input id="dpWindowHours" name="dpWindowHours" type="number" min={1} max={168} defaultValue={settings.dp_window_hours} required />
          </div>
          <div>
            <label htmlFor="etaDaysDefault">Estimasi selesai default untuk batch baru (hari)</label>
            <input
              id="etaDaysDefault"
              name="etaDaysDefault"
              type="number"
              min={1}
              max={365}
              defaultValue={settings.eta_days_default}
              required
            />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="custom-limits-heading">
        <h2 id="custom-limits-heading">Batas custom ukuran</h2>
        <ActionForm action={saveSettingsSection} submitLabel="Simpan batas custom" pendingLabel="Menyimpan…">
          <input type="hidden" name="section" value="customLimits" />
          <div>
            <label htmlFor="chestMaxCm">Lingkar dada maksimal (cm, paling besar 140)</label>
            <input
              id="chestMaxCm"
              name="chestMaxCm"
              type="number"
              step={0.1}
              min={1}
              max={140}
              defaultValue={settings.custom_size_limits.chest_max_cm}
              required
            />
          </div>
          <div>
            <label htmlFor="lengthMaxCm">Panjang badan maksimal (cm, paling besar 145)</label>
            <input
              id="lengthMaxCm"
              name="lengthMaxCm"
              type="number"
              step={0.1}
              min={1}
              max={145}
              defaultValue={settings.custom_size_limits.length_max_cm}
              required
            />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="texts-heading">
        <h2 id="texts-heading">Teks untuk agen</h2>
        <ActionForm action={saveSettingsSection} submitLabel="Simpan teks" pendingLabel="Menyimpan…">
          <input type="hidden" name="section" value="texts" />
          <div>
            <label htmlFor="checkoutConfirmationText">Teks konfirmasi checkout</label>
            <textarea
              id="checkoutConfirmationText"
              name="checkoutConfirmationText"
              defaultValue={settings.checkout_confirmation_text}
              required
            />
          </div>
          <div>
            <label htmlFor="orderTermsText">Syarat dan ketentuan pesanan (opsional)</label>
            <textarea id="orderTermsText" name="orderTermsText" defaultValue={settings.order_terms_text} />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="invoice-heading">
        <h2 id="invoice-heading">Kop invoice</h2>
        <ActionForm action={saveSettingsSection} submitLabel="Simpan kop invoice" pendingLabel="Menyimpan…">
          <input type="hidden" name="section" value="invoiceHeader" />
          <div>
            <label htmlFor="invoiceName">Nama usaha</label>
            <input id="invoiceName" name="invoiceName" defaultValue={settings.invoice_header.name} required />
          </div>
          <div>
            <label htmlFor="invoiceAddress">Alamat</label>
            <textarea id="invoiceAddress" name="invoiceAddress" defaultValue={settings.invoice_header.address} />
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="recipients-heading">
        <h2 id="recipients-heading">Penerima notifikasi</h2>
        <p>Jika tidak ada yang dipilih, semua admin aktif menerima notifikasi.</p>
        <ActionForm action={saveNotificationRecipients} submitLabel="Simpan penerima" pendingLabel="Menyimpan…">
          <fieldset>
            <legend>Admin</legend>
            {admins.map(({ id, fullName, isActive }) => (
              <div key={id}>
                <input
                  id={`recipient-${id}`}
                  name="recipient"
                  type="checkbox"
                  value={id}
                  defaultChecked={settings.notification_recipients.includes(id)}
                />
                <label htmlFor={`recipient-${id}`}>
                  {fullName}
                  {!isActive && " (nonaktif)"}
                </label>
              </div>
            ))}
          </fieldset>
        </ActionForm>
      </section>
    </main>
  );
};

export default SettingsPage;
