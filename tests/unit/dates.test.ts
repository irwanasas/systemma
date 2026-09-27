import { describe, expect, it } from "vitest";
import { formatDateTime, formatShortDateTime, isoToJakartaInput, jakartaInputToIso, formatRelativeTime } from "@/lib/dates";

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

describe("formatRelativeTime", () => {
  const now = new Date("2026-09-27T10:00:00Z").getTime();

  it("describes recent times relative to now", () => {
    expect(formatRelativeTime("2026-09-27T09:59:30Z", now)).toBe("baru saja");
    expect(formatRelativeTime("2026-09-27T09:55:00Z", now)).toBe("5 menit yang lalu");
    expect(formatRelativeTime("2026-09-27T07:00:00Z", now)).toBe("3 jam yang lalu");
    expect(formatRelativeTime("2026-09-26T10:00:00Z", now)).toBe("kemarin");
  });

  it("falls back to the short date after a week", () => {
    expect(formatRelativeTime("2026-09-01T03:00:00Z", now)).toBe("1 Sep, 10.00");
  });
});

