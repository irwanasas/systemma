import "server-only";
import { toRupiah } from "@/lib/money";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Invoice, Payment, PaymentPurpose, PaymentReview, PaymentStatus, PendingPayment } from "@/features/payments/types";

export const PROOF_BUCKET = "payment-proofs";

const SIGNED_URL_SECONDS = 300;

export const createProofUrl = async (proofPath: string): Promise<string | null> => {
  const options = proofPath.endsWith(".pdf") ? { download: true } : undefined;
  const { data, error } = await getAdminClient().storage.from(PROOF_BUCKET).createSignedUrl(proofPath, SIGNED_URL_SECONDS, options);
  if (error) return null;
  return data.signedUrl;
};

export const listOrderPayments = async (orderId: string): Promise<Payment[]> => {
  const { data, error } = await getAdminClient()
    .from("payments")
    .select("id, purpose, amount, status, reject_reason, proof_path, created_at, verified_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    purpose: row.purpose as PaymentPurpose,
    amount: toRupiah(row.amount),
    status: row.status as PaymentStatus,
    rejectReason: row.reject_reason,
    proofPath: row.proof_path,
    createdAt: row.created_at,
    verifiedAt: row.verified_at,
  }));
};

export const getInvoice = async (orderId: string): Promise<Invoice | null> => {
  const { data, error } = await getAdminClient()
    .from("invoices")
    .select("number, issued_at, settled_at")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  return data ? { number: data.number, issuedAt: data.issued_at, settledAt: data.settled_at } : null;
};

const PENDING_SELECT =
  "id, amount, created_at, proof_path, orders!inner(id, number, dp_amount, po_batches!inner(label, products!inner(name)), agents!inner(code, city, users!inner(full_name, phone)))";

type PendingRow = {
  id: string;
  amount: number;
  created_at: string;
  proof_path: string | null;
  orders: {
    id: string;
    number: string;
    dp_amount: number;
    po_batches: { label: string; products: { name: string } };
    agents: { code: string; city: string | null; users: { full_name: string; phone: string | null } };
  };
};

const toPendingPayment = (row: PendingRow): PendingPayment => ({
  id: row.id,
  orderId: row.orders.id,
  orderNumber: row.orders.number,
  agentName: row.orders.agents.users.full_name,
  agentCode: row.orders.agents.code,
  amount: toRupiah(row.amount),
  createdAt: row.created_at,
});

export const listPendingPayments = async (): Promise<PendingPayment[]> => {
  const { data, error } = await getAdminClient()
    .from("payments")
    .select(PENDING_SELECT)
    .eq("status", "PENDING")
    .eq("purpose", "DP")
    .order("created_at")
    .returns<PendingRow[]>();
  if (error) throw error;
  return data.map(toPendingPayment);
};

export const getPaymentReview = async (paymentId: string): Promise<PaymentReview | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) return null;
  const { data, error } = await getAdminClient()
    .from("payments")
    .select(PENDING_SELECT)
    .eq("id", paymentId)
    .eq("status", "PENDING")
    .eq("purpose", "DP")
    .maybeSingle<PendingRow>();
  if (error) throw error;
  if (!data) return null;
  return {
    ...toPendingPayment(data),
    expectedAmount: toRupiah(data.orders.dp_amount),
    productName: data.orders.po_batches.products.name,
    batchLabel: data.orders.po_batches.label,
    agentPhone: data.orders.agents.users.phone,
    agentCity: data.orders.agents.city,
    proofUrl: data.proof_path ? await createProofUrl(data.proof_path) : null,
    isPdf: data.proof_path?.endsWith(".pdf") ?? false,
  };
};
