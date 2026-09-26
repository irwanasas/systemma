import type { z } from "zod";

export type FormState = {
  error?: string;
  message?: string;
};

export const firstIssue = (error: z.ZodError): string => error.issues[0]?.message ?? "Data yang diisi belum benar.";

export const DB_UNIQUE_VIOLATION = "23505";

export const DB_FOREIGN_KEY_VIOLATION = "23503";

export const DB_CHECK_VIOLATION = "23514";

const rpcErrorMessages: Record<string, string> = {
  FORBIDDEN: "Anda tidak punya akses untuk tindakan ini.",
  BATCH_NOT_OPEN: "Batch PO ini sudah tidak dibuka. Muat ulang halaman untuk melihat batch terbaru.",
  INVALID_QTY: "Jumlah harus berupa angka bulat 0 atau lebih.",
  VARIANT_NOT_AVAILABLE: "Warna atau ukuran ini sedang tidak tersedia.",
  CUSTOM_SIZE_NOT_AVAILABLE: "Seri ini tidak menerima custom ukuran.",
  COLOR_NOT_AVAILABLE: "Warna yang dipilih tidak tersedia untuk seri ini.",
  CUSTOM_SIZE_OUT_OF_RANGE: "Ukuran custom di luar batas: lingkar dada maksimal 140 cm dan panjang badan maksimal 145 cm.",
  CART_ITEM_NOT_FOUND: "Barang ini sudah tidak ada di keranjang. Muat ulang halaman.",
  CART_EMPTY: "Keranjang masih kosong.",
  CART_HAS_UNAVAILABLE_ITEMS: "Ada barang yang sudah tidak tersedia. Hapus barang bertanda “tidak tersedia” lalu coba lagi.",
  ORDER_NOT_FOUND: "Pesanan tidak ditemukan.",
  ORDER_NOT_CANCELLABLE: "Pesanan ini tidak bisa dibatalkan karena bukti DP sudah dikirim atau diproses.",
  INVALID_STATUS_TRANSITION: "Status pesanan tidak bisa diubah ke tahap itu. Muat ulang halaman untuk melihat status terbaru.",
  IDEMPOTENCY_KEY_REUSED: "Formulir ini sudah dipakai untuk pesanan lain. Muat ulang halaman lalu coba lagi.",
  ORDER_NOT_AWAITING_DP: "Pesanan ini tidak sedang menunggu DP, jadi bukti tidak perlu diunggah lagi.",
  DP_DEADLINE_PASSED: "Batas waktu pembayaran DP sudah lewat, jadi pesanan tidak bisa dilanjutkan.",
  INVALID_AMOUNT: "Nominal transfer harus lebih dari 0.",
  INVALID_PROOF_PATH: "Bukti transfer gagal disimpan. Silakan unggah ulang.",
  PAYMENT_NOT_FOUND: "Pembayaran tidak ditemukan.",
  PAYMENT_ALREADY_REVIEWED: "Pembayaran ini sudah diperiksa admin lain. Muat ulang halaman.",
  REJECT_REASON_REQUIRED: "Tulis alasan penolakan agar agen tahu apa yang harus diperbaiki.",
};

type RpcError = { message: string };

export const rpcErrorMessage = (error: RpcError): string | null => rpcErrorMessages[error.message] ?? null;
