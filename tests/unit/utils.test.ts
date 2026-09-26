import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("treats text-ui as a font size, so text colors survive", () => {
    expect(cn("text-primary-foreground", "text-ui")).toBe("text-primary-foreground text-ui");
    expect(cn("text-sm", "text-ui")).toBe("text-ui");
  });
});
