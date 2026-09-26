import { randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";

const BCRYPT_COST = 12;

const UNKNOWN_USER_HASH = "$2b$12$xFGz1O0c6An1N9sCCQnU1uxT/TI0FUi7i3Hto9e3PGqNqUctG3k1q";

export const hashPassword = (password: string): Promise<string> => hash(password, BCRYPT_COST);

export const verifyPassword = async (password: string, passwordHash: string | null): Promise<boolean> => {
  if (!passwordHash) {
    await compare(password, UNKNOWN_USER_HASH);
    return false;
  }
  return compare(password, passwordHash);
};

export const generateInitialPassword = (): string => randomBytes(9).toString("base64url");
