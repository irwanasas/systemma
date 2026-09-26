import { describe, expect, it } from "vitest";
import { dpAmountFor, formatRupiah, parseRupiahInput, toRupiah } from "@/lib/money";

describe("money", () => {
  it("formats integer rupiah without decimals", () => {
    expect(formatRupiah(toRupiah(250000)).replace(/\s/g, " ")).toBe("Rp 250.000");
  });

  it("parses admin input with thousand separators", () => {
    expect(parseRupiahInput("250.000")).toBe(250000);
    expect(parseRupiahInput("Rp 1.250.000")).toBe(1250000);
    expect(parseRupiahInput("275000")).toBe(275000);
  });

  it("rejects decimals, negatives, zero and text", () => {
    expect(parseRupiahInput("250000,50")).toBeNull();
    expect(parseRupiahInput("-5000")).toBeNull();
    expect(parseRupiahInput("0")).toBeNull();
    expect(parseRupiahInput("dua ratus")).toBeNull();
  });

  it("refuses non-integer amounts", () => {
    expect(() => toRupiah(1.5)).toThrow();
  });
});

describe("dpAmountFor", () => {
  it("matches the SQL rule ceil(subtotal × percent / 100) with integers", () => {
    expect(dpAmountFor(1100003, 25)).toBe(275001);
    expect(dpAmountFor(800000, 25)).toBe(200000);
    expect(dpAmountFor(1, 25)).toBe(1);
    expect(dpAmountFor(0, 25)).toBe(0);
  });
});
