import { describe, it, expect } from "vitest";
import { isValidEmail, isValidPassword, validateRequired } from "./apiHelpers";

describe("apiHelpers", () => {
  describe("isValidEmail", () => {
    it("should return true for valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
    });

    it("should return false for invalid emails", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail(123)).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("should validate password with default options", () => {
      expect(isValidPassword("Password123")).toBe(true); // 8+ chars, upper, lower, number
      expect(isValidPassword("pass")).toBe(false); // too short
      expect(isValidPassword("password123")).toBe(false); // no uppercase
    });
  });

  describe("validateRequired", () => {
    it("should return null if all required fields are present", () => {
      const data = { name: "John", age: 30 };
      expect(validateRequired(data, ["name", "age"])).toBe(null);
    });

    it("should return errors for missing fields", () => {
      const data = { name: "John" };
      const errors = validateRequired(data, ["name", "age"]);
      expect(errors).toHaveProperty("age");
      expect(errors.age).toBe("age is required");
    });
  });
});
