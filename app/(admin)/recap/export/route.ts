import { requireRole } from "@/lib/auth/require-role";
import { parseRecapPeriod } from "@/features/recap/period";
import { buildRecapWorkbook } from "@/features/recap/server/export";
import { getRecapRows } from "@/features/recap/server/queries";
import { summarizeRecap } from "@/features/recap/summarize";

export const GET = async (request: Request): Promise<Response> => {
  await requireRole("admin");
  const { searchParams } = new URL(request.url);
  const period = parseRecapPeriod(searchParams.get("from"), searchParams.get("to"));
  const workbook = await buildRecapWorkbook(summarizeRecap(await getRecapRows(period)), period);
  return new Response(workbook, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rekap-aurora-${period.from}-${period.to}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
};
