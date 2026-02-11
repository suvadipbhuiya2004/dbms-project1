import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { useAuthStore } from "@/store/authStore";

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock fetch
global.fetch = vi.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: null }),
  })
);

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().resetAuth();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  // Note: Testing useEffect and async fetch in hooks requires more setup
  // and waiting for updates. Keeping this simple for now.

  it("should expose auth methods", () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });
});
