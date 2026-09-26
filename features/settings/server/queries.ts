import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";

export type BankAccount = {
  bank: string;
  number: string;
  holder: string;
};

export type InvoiceHeader = {
  name: string;
  address: string;
  logo_path: string | null;
};

export type AppSettings = {
  bank_accounts: BankAccount[];
  dp_percent: number;
  dp_window_hours: number;
  eta_days_default: number;
  custom_size_limits: { chest_max_cm: number; length_max_cm: number };
  checkout_confirmation_text: string;
  invoice_header: InvoiceHeader;
  notification_recipients: string[];
  order_terms_text: string;
};

export const getSettings = async (): Promise<AppSettings> => {
  const { data, error } = await getAdminClient().from("app_settings").select("key, value");
  if (error) throw error;
  return Object.fromEntries(data.map(({ key, value }) => [key, value])) as AppSettings;
};
