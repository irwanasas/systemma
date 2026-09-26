import { describe, expect, it } from "vitest";
import { createSessionToken, hashSessionToken } from "@/lib/auth/session";

describe("session token", () => {
  it("is 32 random bytes encoded as base64url", () => {
    const token = createSessionToken();
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(createSessionToken()).not.toBe(token);
  });

  it("is stored as a sha256 hex digest, never as the token itself", () => {
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(tokenHash).not.toBe(token);
    expect(hashSessionToken(token)).toBe(tokenHash);
  });
});
