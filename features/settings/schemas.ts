import { z } from "zod";

const bankRow = (index: number) => ({
  [`bank${index}`]: z.string().trim(),
  [`number${index}`]: z.string().trim(),
  [`holder${index}`]: z.string().trim(),
});

export const BANK_ROWS = 3;

export const bankAccountsSchema = z
  .object(Object.assign({}, ...Array.from({ length: BANK_ROWS }, (_, index) => bankRow(index))) as Record<string, z.ZodString>)
  .transform((values, context) => {
    const accounts = [];
    for (let index = 0; index < BANK_ROWS; index += 1) {
      const bank = values[`bank${index}`];
      const number = values[`number${index}`];
      const holder = values[`holder${index}`];
      if (!bank && !number && !holder) continue;
      if (!bank || !number || !holder) {
        context.addIssue({ code: "custom", message: `Rekening baris ${index + 1}: isi nama bank, nomor, dan atas nama.` });
        return z.NEVER;
      }
      if (!/^[0-9 -]{5,30}$/.test(number)) {
        context.addIssue({ code: "custom", message: `Rekening baris ${index + 1}: nomor rekening hanya boleh angka.` });
        return z.NEVER;
      }
      accounts.push({ bank, number, holder });
    }
    return { bank_accounts: accounts };
  });

const integer = (label: string, min: number, max: number) =>
  z.coerce
    .number({ message: `${label} harus berupa angka.` })
    .int(`${label} harus bilangan bulat.`)
    .min(min, `${label} minimal ${min}.`)
    .max(max, `${label} maksimal ${max}.`);

export const paymentRulesSchema = z
  .object({
    dpPercent: integer("Persentase DP", 1, 100),
    dpWindowHours: integer("Batas waktu DP", 1, 168),
    etaDaysDefault: integer("Estimasi hari default", 1, 365),
  })
  .transform(({ dpPercent, dpWindowHours, etaDaysDefault }) => ({
    dp_percent: dpPercent,
    dp_window_hours: dpWindowHours,
    eta_days_default: etaDaysDefault,
  }));

const centimeters = (label: string, max: number) =>
  z.coerce.number({ message: `${label} harus berupa angka.` }).gt(0, `${label} harus lebih dari 0.`).max(max, `${label} maksimal ${max} cm.`);

export const customLimitsSchema = z
  .object({ chestMaxCm: centimeters("Lingkar dada maksimal", 140), lengthMaxCm: centimeters("Panjang badan maksimal", 145) })
  .transform(({ chestMaxCm, lengthMaxCm }) => ({
    custom_size_limits: { chest_max_cm: chestMaxCm, length_max_cm: lengthMaxCm },
  }));

export const textsSchema = z
  .object({
    checkoutConfirmationText: z.string().trim().min(1, "Teks konfirmasi checkout wajib diisi.").max(1000),
    orderTermsText: z.string().trim().max(5000),
  })
  .transform(({ checkoutConfirmationText, orderTermsText }) => ({
    checkout_confirmation_text: checkoutConfirmationText,
    order_terms_text: orderTermsText,
  }));

export const invoiceHeaderSchema = z
  .object({
    invoiceName: z.string().trim().min(1, "Nama pada invoice wajib diisi.").max(120),
    invoiceAddress: z.string().trim().max(500),
  })
  .transform(({ invoiceName, invoiceAddress }) => ({
    invoice_header: { name: invoiceName, address: invoiceAddress, logo_path: null },
  }));

export const settingsSections = {
  bankAccounts: bankAccountsSchema,
  paymentRules: paymentRulesSchema,
  customLimits: customLimitsSchema,
  texts: textsSchema,
  invoiceHeader: invoiceHeaderSchema,
} as const;

export type SettingsSection = keyof typeof settingsSections;
