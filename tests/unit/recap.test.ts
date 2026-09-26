import { describe, expect, it } from "vitest";
import { toRupiah } from "@/lib/money";
import { parseRecapPeriod } from "@/features/recap/period";
import { summarizeRecap } from "@/features/recap/summarize";
import type { RecapRow } from "@/features/recap/types";

const row = (overrides: Partial<RecapRow>): RecapRow => ({
  agentId: "a",
  agentCode: "A",
  agentName: "Agen A",
  categoryCode: "dress",
  categoryName: "Dress",
  productName: "Zelline",
  batchLabel: "B1",
  orderCount: 1,
  qty: 1,
  orderValue: toRupiah(100000),
  dpReceived: toRupiah(0),
  settlementReceived: toRupiah(0),
  ...overrides,
});

describe("summarizeRecap", () => {
  it("groups by agent with category quantities and totals", () => {
    const summary = summarizeRecap([
      row({ qty: 6, orderValue: toRupiah(620000), dpReceived: toRupiah(130000) }),
      row({ productName: "Anshara", categoryCode: "koko", qty: 5, orderValue: toRupiah(400000) }),
      row({ agentId: "b", agentCode: "B", categoryCode: "khimar_voal", qty: 2, orderValue: toRupiah(190000), settlementReceived: toRupiah(142500) }),
    ]);
    expect(summary.agents).toHaveLength(2);
    expect(summary.agents[0].qtyByCategory).toEqual({ dress: 6, koko: 5, khimar_voal: 0 });
    expect(summary.agents[0].totals).toEqual({ qty: 11, orderValue: 1020000, dpReceived: 130000, settlementReceived: 0 });
    expect(summary.qtyByCategory).toEqual({ dress: 6, koko: 5, khimar_voal: 2 });
    expect(summary.totals).toEqual({ qty: 13, orderValue: 1210000, dpReceived: 130000, settlementReceived: 142500 });
  });
});

describe("parseRecapPeriod", () => {
  it("reads dates as whole days in Asia/Jakarta", () => {
    expect(parseRecapPeriod("2026-09-01", "2026-09-30")).toEqual({
      from: "2026-09-01",
      to: "2026-09-30",
      fromIso: "2026-08-31T17:00:00.000Z",
      toExclusiveIso: "2026-09-30T17:00:00.000Z",
    });
  });

  it("falls back to the start of the month for invalid or reversed input", () => {
    expect(parseRecapPeriod("bukan tanggal", "2026-09-15").from).toBe("2026-09-01");
    expect(parseRecapPeriod("2026-10-01", "2026-09-15").from).toBe("2026-09-01");
  });
});

describe("parseRecapPeriod with impossible dates", () => {
  it("ignores dates that match the pattern but do not exist", () => {
    expect(() => parseRecapPeriod("2026-99-99", "2026-02-31")).not.toThrow();
    expect(parseRecapPeriod("2026-02-01", "2026-02-31").to).not.toBe("2026-02-31");
  });
});
