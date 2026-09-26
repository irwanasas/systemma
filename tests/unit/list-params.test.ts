import { describe, expect, it } from "vitest";
import { buildHref, matchesQuery, pageRange, paginate, readPage, readPageSize, readParam, toSearchTerm } from "@/lib/list-params";

describe("list params", () => {
  it("reads the first trimmed value", () => {
    expect(readParam([" a ", "b"])).toBe("a");
    expect(readParam("  ")).toBeUndefined();
    expect(readParam(undefined)).toBeUndefined();
  });

  it("builds hrefs without empty params", () => {
    expect(buildHref("/orders", { status: "AWAITING_DP", q: undefined, page: "" })).toBe("/orders?status=AWAITING_DP");
    expect(buildHref("/orders", {})).toBe("/orders");
  });

  it("clamps the requested page", () => {
    const items = Array.from({ length: 45 }, (_, index) => index);
    expect(paginate(items, "2", 20)).toMatchObject({ page: 2, pageCount: 3, total: 45, items: items.slice(20, 40) });
    expect(paginate(items, "99", 20).page).toBe(3);
    expect(paginate(items, "abc", 20).page).toBe(1);
    expect(paginate([], undefined, 20)).toMatchObject({ page: 1, pageCount: 1, items: [] });
  });

  it("matches case-insensitively across fields", () => {
    expect(matchesQuery("siti", "AUR-1", "Siti Rahmawati")).toBe(true);
    expect(matchesQuery("xyz", "AUR-1", null)).toBe(false);
    expect(matchesQuery(undefined, "anything")).toBe(true);
  });

  it("strips characters that would break a PostgREST filter", () => {
    expect(toSearchTerm(" AUR-2026,(x)*%_ ")).toBe("AUR-2026 x");
    expect(toSearchTerm("Ny. Siti\\")).toBe("Ny. Siti");
    expect(toSearchTerm(undefined)).toBe("");
  });

  it("accepts only the offered page sizes and positive pages", () => {
    expect(readPageSize("50", 20)).toBe(50);
    expect(readPageSize("33", 20)).toBe(20);
    expect(readPageSize(undefined, 10)).toBe(10);
    expect(readPage("0")).toBe(1);
    expect(readPage("abc")).toBe(1);
    expect(readPage("3")).toBe(3);
  });

  it("computes the shown range", () => {
    expect(pageRange(2, 20, 25)).toEqual({ from: 21, to: 25, pageCount: 2 });
    expect(pageRange(1, 10, 0)).toEqual({ from: 0, to: 0, pageCount: 1 });
  });
});
