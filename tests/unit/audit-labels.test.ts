import { describe, expect, it } from "vitest";
import { auditActionLabel, auditActionsMatching, auditEntityLabel } from "@/features/audit/labels";

describe("audit labels", () => {
  it("translates known actions and entities", () => {
    expect(auditActionLabel("update_settings")).toBe("Pengaturan diubah");
    expect(auditEntityLabel("po_batch")).toBe("Batch PO");
  });

  it("falls back to the raw value", () => {
    expect(auditActionLabel("something_new")).toBe("something_new");
    expect(auditEntityLabel("thing")).toBe("thing");
  });

  it("finds actions by Indonesian label or code", () => {
    expect(auditActionsMatching("pengaturan")).toEqual(["update_settings"]);
    expect(auditActionsMatching("DP ditolak".toLowerCase())).toEqual(["reject_dp"]);
    expect(auditActionsMatching("zzz")).toEqual([]);
  });
});
