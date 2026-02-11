import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from "./crypto";

describe("crypto lib", () => {
  describe("Password Hashing", () => {
    it("should hash a password correctly", async () => {
      const password = "password123";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify a correct password", async () => {
      const password = "password123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "password123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("wrongpassword", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("JWT Tokens", () => {
    it("should generate a valid token", () => {
      const payload = { userId: 123, role: "STUDENT" };
      const token = generateToken(payload);

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // Header, Payload, Signature
    });

    it("should verify and decode a valid token", () => {
      const payload = { userId: 123, role: "ADMIN" };
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(payload);
      expect(decoded).toHaveProperty("iat");
      expect(decoded).toHaveProperty("exp");
    });

    it("should return null for an invalid token", () => {
      const invalidToken = "invalid.token.string";
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBe(null);
    });
  });
});
