import { describe, expect, it } from "vitest";
import { generateInitialPassword, hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password", () => {
  it("hashes with bcrypt cost 12 and verifies the original password", async () => {
    const passwordHash = await hashPassword("rahasia-aurora");
    expect(passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(await verifyPassword("rahasia-aurora", passwordHash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const passwordHash = await hashPassword("rahasia-aurora");
    expect(await verifyPassword("salah", passwordHash)).toBe(false);
  });

  it("rejects when the user does not exist", async () => {
    expect(await verifyPassword("apa-saja", null)).toBe(false);
  });

  it("verifies $2a$ hashes created by pgcrypto in the seed", async () => {
    const pgcryptoHash = "$2a$12$xuomPKsi11Q2d8biA/lHdOYscR2fsPKOXaCHlnQSU6FWfFtAHB7pG";
    expect(await verifyPassword("seed-password", pgcryptoHash)).toBe(true);
    expect(await verifyPassword("wrong", pgcryptoHash)).toBe(false);
  });

  it("generates distinct initial passwords of 12 characters", () => {
    const first = generateInitialPassword();
    expect(first).toHaveLength(12);
    expect(generateInitialPassword()).not.toBe(first);
  });
});
