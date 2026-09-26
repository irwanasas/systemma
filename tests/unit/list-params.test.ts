import { describe, expect, it } from "vitest";
import { buildHref, matchesQuery, paginate, readParam, toSearchTerm } from "@/lib/list-params";

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
});
