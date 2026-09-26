import type { Rupiah } from "@/lib/money";

export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type PaymentPurpose = "DP" | "SETTLEMENT";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Menunggu dicek",
  VERIFIED: "Diterima",
  REJECTED: "Ditolak",
};

export const paymentPurposeLabels: Record<PaymentPurpose, string> = {
  DP: "DP",
  SETTLEMENT: "Pelunasan",
};

export type Payment = {
  id: string;
  purpose: PaymentPurpose;
  amount: Rupiah;
  status: PaymentStatus;
  rejectReason: string | null;
  proofPath: string | null;
  createdAt: string;
  verifiedAt: string | null;
};

export type PendingPayment = {
  id: string;
  orderId: string;
  orderNumber: string;
  agentName: string;
  agentCode: string;
  amount: Rupiah;
  createdAt: string;
};

export type PaymentReview = PendingPayment & {
  expectedAmount: Rupiah;
  productName: string;
  batchLabel: string;
  agentPhone: string | null;
  agentCity: string | null;
  proofUrl: string | null;
  isPdf: boolean;
};

export type Invoice = {
  number: string;
  issuedAt: string;
  settledAt: string | null;
};
