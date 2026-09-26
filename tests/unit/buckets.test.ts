import { describe, expect, it } from "vitest";
import { dailyValues, firstWeekStart, jakartaDate, weeklyValues } from "@/features/dashboard/buckets";
import { formatRupiahCompact } from "@/lib/money";

describe("chart buckets", () => {
  it("uses the Jakarta date", () => {
    expect(jakartaDate("2026-09-27T17:30:00Z")).toBe("2026-09-28");
  });

  it("groups order value into Monday-based weeks ending with the current week", () => {
    expect(firstWeekStart("2026-09-27", 8)).toBe("2026-08-03");
    const points = weeklyValues(
      [
        { createdAt: "2026-09-21T01:00:00Z", subtotal: 100 },
        { createdAt: "2026-09-27T10:00:00Z", subtotal: 50 },
        { createdAt: "2026-09-20T18:00:00Z", subtotal: 7 },
        { createdAt: "2026-07-01T00:00:00Z", subtotal: 999 },
      ],
      "2026-09-27",
      8,
    );
    expect(points).toHaveLength(8);
    expect(points.at(-1)).toEqual({ label: "21 Sep", value: 157 });
    expect(points.reduce((sum, { value }) => sum + value, 0)).toBe(157);
  });

  it("fills every day of the range", () => {
    const points = dailyValues([{ createdAt: "2026-09-02T03:00:00Z", subtotal: 40 }], "2026-09-01", "2026-09-03");
    expect(points.map(({ value }) => value)).toEqual([0, 40, 0]);
    expect(points[0].label).toBe("1 Sep");
  });

  it("formats compact rupiah", () => {
    expect(formatRupiahCompact(2_670_000)).toMatch(/^Rp 2,7\sjt$/);
  });
});
