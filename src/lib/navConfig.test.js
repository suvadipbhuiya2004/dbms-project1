import { describe, it, expect } from "vitest";
import { NAV_BY_ROLE } from "./navConfig";

describe("navConfig", () => {
  it("should have configuration for all roles", () => {
    expect(NAV_BY_ROLE).toHaveProperty("ADMIN");
    expect(NAV_BY_ROLE).toHaveProperty("STUDENT");
    expect(NAV_BY_ROLE).toHaveProperty("INSTRUCTOR");
    expect(NAV_BY_ROLE).toHaveProperty("DATA_ANALYST");
  });

  it("should have correct structure for menu items", () => {
    Object.values(NAV_BY_ROLE)
      .flat()
      .forEach((item) => {
        expect(item).toHaveProperty("label");
        expect(item).toHaveProperty("href");
        expect(item).toHaveProperty("icon");
        expect(typeof item.label).toBe("string");
        expect(typeof item.href).toBe("string");
        expect(typeof item.icon).toBe("string");
      });
  });

  it("should have correct dashboard link for all roles", () => {
    Object.keys(NAV_BY_ROLE).forEach((role) => {
      const dashboardLink = NAV_BY_ROLE[role].find(
        (item) => item.label === "Dashboard",
      );
      expect(dashboardLink).toBeDefined();
      expect(dashboardLink.href).toBe("/dashboard");
    });
  });
});
