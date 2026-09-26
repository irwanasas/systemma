import "server-only";
import ExcelJS from "exceljs";
import { RECAP_CATEGORIES } from "@/features/recap/summarize";
import type { RecapPeriod } from "@/features/recap/period";
import type { RecapSummary } from "@/features/recap/types";

const RUPIAH_FORMAT = '"Rp" #,##0';

export const buildRecapWorkbook = async (summary: RecapSummary, period: RecapPeriod): Promise<ArrayBuffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Rekap");
  sheet.addRow([`Rekap pesanan per agen · ${period.from} s.d. ${period.to} (WIB)`]).font = { bold: true, size: 13 };
  sheet.addRow(["Pesanan dibatalkan dan kedaluwarsa tidak dihitung. DP dan pelunasan = dana yang sudah diterima."]);
  sheet.addRow([]);

  const header = sheet.addRow([
    "Kode agen",
    "Nama agen",
    "Kategori",
    "Seri",
    "Batch",
    "Jumlah pesanan",
    "Pcs",
    "Nilai pesanan",
    "DP diterima",
    "Pelunasan diterima",
  ]);
  header.font = { bold: true };

  for (const agent of summary.agents) {
    for (const row of agent.rows) {
      sheet.addRow([
        row.agentCode,
        row.agentName,
        row.categoryName,
        row.productName,
        row.batchLabel,
        row.orderCount,
        row.qty,
        row.orderValue,
        row.dpReceived,
        row.settlementReceived,
      ]);
    }
    const categoryText = RECAP_CATEGORIES.map(({ code, name }) => `${name} ${agent.qtyByCategory[code]} pcs`).join(" · ");
    const totalRow = sheet.addRow([
      agent.agentCode,
      `Total ${agent.agentName}`,
      categoryText,
      "",
      "",
      "",
      agent.totals.qty,
      agent.totals.orderValue,
      agent.totals.dpReceived,
      agent.totals.settlementReceived,
    ]);
    totalRow.font = { bold: true };
  }

  sheet.addRow([]);
  const grandTotal = sheet.addRow([
    "",
    "Total semua agen",
    RECAP_CATEGORIES.map(({ code, name }) => `${name} ${summary.qtyByCategory[code]} pcs`).join(" · "),
    "",
    "",
    "",
    summary.totals.qty,
    summary.totals.orderValue,
    summary.totals.dpReceived,
    summary.totals.settlementReceived,
  ]);
  grandTotal.font = { bold: true };

  sheet.columns.forEach((column, index) => {
    column.width = [10, 24, 30, 20, 8, 14, 8, 16, 16, 18][index];
    if (index >= 7) column.numFmt = RUPIAH_FORMAT;
  });
  sheet.views = [{ state: "frozen", ySplit: 4 }];

  return workbook.xlsx.writeBuffer();
};
