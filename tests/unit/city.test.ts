import { describe, expect, it } from "vitest";
import { cityFromAddress } from "@/features/landing/city";

describe("cityFromAddress", () => {
  it("takes the last part without the postal code", () => {
    expect(cityFromAddress("Jl. Pandanaran No. 88, Semarang 50134")).toBe("Semarang");
    expect(cityFromAddress("Kudus")).toBe("Kudus");
  });

  it("returns null for an empty address", () => {
    expect(cityFromAddress("")).toBeNull();
    expect(cityFromAddress("Jl. Mawar, 50134")).toBeNull();
  });
});
