const actionLabels: Record<string, string> = {
  add_color: "Warna ditambahkan",
  approve_dp: "DP disetujui",
  archive_product: "Produk diarsipkan",
  cancel_order: "Pesanan dibatalkan",
  cart_clear: "Keranjang dikosongkan",
  cart_remove_item: "Barang dihapus dari keranjang",
  cart_upsert_item: "Keranjang diubah",
  checkout: "Checkout",
  create_agent: "Agen dibuat",
  create_announcement: "Pengumuman diterbitkan",
  create_batch: "Batch dibuat",
  create_product: "Produk dibuat",
  deactivate_agent: "Agen dinonaktifkan",
  delete_announcement: "Pengumuman dihapus",
  delete_color: "Warna dihapus",
  delete_product: "Produk dihapus",
  expire_order: "Pesanan kedaluwarsa",
  mark_settled: "Pelunasan diterima",
  order_transition: "Status pesanan diubah",
  reject_dp: "DP ditolak",
  reset_agent_password: "Password agen diatur ulang",
  set_batch_status: "Status batch diubah",
  submit_dp_proof: "Bukti DP dikirim",
  update_product: "Produk diubah",
  update_settings: "Pengaturan diubah",
  update_size_prices: "Harga ukuran diubah",
};

const entityLabels: Record<string, string> = {
  announcement: "Pengumuman",
  cart: "Keranjang",
  cart_item: "Barang keranjang",
  order: "Pesanan",
  payment: "Pembayaran",
  po_batch: "Batch PO",
  product: "Produk",
  settings: "Pengaturan",
  user: "Pengguna",
};

export const auditActionLabel = (action: string): string => actionLabels[action] ?? action;

export const auditEntityLabel = (entity: string): string => entityLabels[entity] ?? entity;

export const auditActionsMatching = (query: string): string[] => {
  const needle = query.toLocaleLowerCase("id-ID");
  return Object.entries(actionLabels)
    .filter(([code, label]) => code.includes(needle) || label.toLocaleLowerCase("id-ID").includes(needle))
    .map(([code]) => code);
};
