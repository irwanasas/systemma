import { describe, expect, it } from "vitest";
import { formatDateTime, formatShortDateTime, isoToJakartaInput, jakartaInputToIso } from "@/lib/dates";

describe("dates", () => {
  it("reads datetime-local input as Asia/Jakarta time", () => {
    expect(jakartaInputToIso("2026-10-01T09:00")).toBe("2026-10-01T02:00:00.000Z");
  });

  it("round-trips back to the input format in Jakarta time", () => {
    expect(isoToJakartaInput("2026-10-01T02:00:00.000Z")).toBe("2026-10-01T09:00");
  });

  it("rejects malformed input", () => {
    expect(jakartaInputToIso("01/10/2026 09:00")).toBeNull();
  });

  it("displays UTC timestamps in WIB", () => {
    expect(formatDateTime("2026-10-01T17:30:00.000Z")).toContain("00.30");
    expect(formatDateTime("2026-10-01T17:30:00.000Z")).toMatch(/2 Okt 2026/);
  });
});

describe("formatShortDateTime", () => {
  it("shows day, short month and time in WIB without the year", () => {
    expect(formatShortDateTime("2026-09-26T11:36:00.000Z")).toBe("26 Sep, 18.36");
  });
});
