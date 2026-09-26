import { describe, expect, it } from "vitest";
import { recapPresets } from "@/features/recap/period";

describe("recap presets", () => {
  it("builds month, rolling and year ranges from today", () => {
    expect(recapPresets("2026-03-15")).toEqual([
      { label: "Bulan ini", from: "2026-03-01", to: "2026-03-15" },
      { label: "Bulan lalu", from: "2026-02-01", to: "2026-02-28" },
      { label: "7 hari terakhir", from: "2026-03-09", to: "2026-03-15" },
      { label: "30 hari terakhir", from: "2026-02-14", to: "2026-03-15" },
      { label: "Tahun ini", from: "2026-01-01", to: "2026-03-15" },
    ]);
  });

  it("handles January", () => {
    expect(recapPresets("2026-01-05")[1]).toEqual({ label: "Bulan lalu", from: "2025-12-01", to: "2025-12-31" });
  });
});
