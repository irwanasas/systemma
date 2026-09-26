import { ActionForm } from "@/components/ui/action-form";
import { PageTabs } from "@/components/ui/page-tabs";
import { SectionCard } from "@/components/ui/section-card";
import { BankAccountsFields } from "@/features/settings/components/bank-accounts-fields";
import { BANK_ROWS } from "@/features/settings/schemas";
import { saveNotificationRecipients, saveSettingsSection } from "@/features/settings/server/actions";
import { getSettings, listAdmins } from "@/features/settings/server/queries";
import { requireRole } from "@/lib/auth/require-role";

const hint = (text: string): React.ReactNode => <p className="text-ui text-muted-foreground">{text}</p>;

const SettingsPage = async (): Promise<React.ReactNode> => {
  await requireRole("admin");
  const [settings, admins] = await Promise.all([getSettings(), listAdmins()]);

  const bankTab = (
    <SectionCard id="bank-heading" title="Rekening tujuan transfer">
      {hint("Ditampilkan ke agen saat membayar DP.")}
      <ActionForm action={saveSettingsSection} submitLabel="Simpan rekening" pendingLabel="Menyimpan…">
        <input type="hidden" name="section" value="bankAccounts" />
        <BankAccountsFields accounts={settings.bank_accounts} maxRows={BANK_ROWS} />
      </ActionForm>
    </SectionCard>
  );

  const paymentTab = (
    <SectionCard id="payment-rules-heading" title="DP dan estimasi">
      {hint("Perubahan hanya berlaku untuk pesanan baru.")}
      <ActionForm action={saveSettingsSection} submitLabel="Simpan aturan DP" pendingLabel="Menyimpan…">
        <input type="hidden" name="section" value="paymentRules" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="dpPercent">DP (% dari subtotal)</label>
            <input id="dpPercent" name="dpPercent" type="number" min={1} max={100} defaultValue={settings.dp_percent} required />
          </div>
          <div>
            <label htmlFor="dpWindowHours">Batas bayar DP (jam)</label>
            <input
              id="dpWindowHours"
              name="dpWindowHours"
              type="number"
              min={1}
              max={168}
              defaultValue={settings.dp_window_hours}
              required
              aria-describedby="dpWindowHours-hint"
            />
            <p id="dpWindowHours-hint" className="mt-1 text-sm text-muted-foreground">
              Dihitung sejak checkout.
            </p>
          </div>
          <div>
            <label htmlFor="etaDaysDefault">Estimasi default batch baru (hari)</label>
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
        </div>
      </ActionForm>
    </SectionCard>
  );

  const customTab = (
    <SectionCard id="custom-limits-heading" title="Batas custom ukuran">
      <ActionForm action={saveSettingsSection} submitLabel="Simpan batas custom" pendingLabel="Menyimpan…">
        <input type="hidden" name="section" value="customLimits" />
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </ActionForm>
    </SectionCard>
  );

  const textsTab = (
    <SectionCard id="texts-heading" title="Teks untuk agen">
      <ActionForm action={saveSettingsSection} submitLabel="Simpan teks" pendingLabel="Menyimpan…">
        <input type="hidden" name="section" value="texts" />
        <div>
          <label htmlFor="checkoutConfirmationText">Teks konfirmasi checkout</label>
          <textarea
            id="checkoutConfirmationText"
            name="checkoutConfirmationText"
            defaultValue={settings.checkout_confirmation_text}
            required
            className="!max-w-none"
          />
        </div>
        <div>
          <label htmlFor="orderTermsText">Syarat dan ketentuan pesanan (opsional)</label>
          <textarea id="orderTermsText" name="orderTermsText" defaultValue={settings.order_terms_text} className="!max-w-none" />
        </div>
      </ActionForm>
    </SectionCard>
  );

  const invoiceTab = (
    <SectionCard id="invoice-heading" title="Kop invoice">
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
    </SectionCard>
  );

  const recipientsTab = (
    <SectionCard id="recipients-heading" title="Penerima notifikasi">
      {hint("Jika tidak ada yang dipilih, semua admin aktif menerima notifikasi.")}
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
    </SectionCard>
  );

  return (
    <main>
      <h1>Pengaturan</h1>
      <PageTabs
        label="Bagian pengaturan"
        orientation="vertical"
        tabs={[
          { value: "bank", label: "Rekening", content: bankTab },
          { value: "payment", label: "DP & estimasi", content: paymentTab },
          { value: "custom", label: "Custom ukuran", content: customTab },
          { value: "texts", label: "Teks agen", content: textsTab },
          { value: "invoice", label: "Kop invoice", content: invoiceTab },
          { value: "recipients", label: "Notifikasi", content: recipientsTab },
        ]}
      />
    </main>
  );
};

export default SettingsPage;
